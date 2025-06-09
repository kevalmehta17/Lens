"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

//This function syncs the current user with the database.
// It checks if the user exists in the database, and if not, creates a new user record.
export async function syncUser() {
    try {
        const { userId } = await auth();     // Gets the current user’s ID (from JWT/session)
        const user = await currentUser();    // Gets the user’s profile (from Clerk API)
        if (!user || !userId) return;

        // Check if the user already exists in the database
        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            }
        })
        if (existingUser) {
            return existingUser; // If user exists, return the existing user
        }

        // If user does not exist, create a new user in the database
        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                // keval@gmail.com -> keval
                username: user.username ?? user.emailAddresses[0]?.emailAddress.split("@")[0],
                email: user.emailAddresses[0]?.emailAddress || "",
                image: user.imageUrl || "",
            }
        })

        return dbUser;

    } catch (error) {
        console.error("Error syncing user:", error);
        throw new Error("Failed to sync user with database");

    }
}


// this function retrieves a user from the database by their Clerk ID
export async function getUserByClerkId(clerkId: string) {
    return await prisma.user.findUnique({
        where: {
            clerkId,
        },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                }
            }
        }
    })
}

// This function retrieves the current user's ID from the database.
export async function getDbUserId() {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
        return null;
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) throw new Error("User not found in database");

    return user.id
}

export async function getRandomUsers() {
    try {
        const userId = await getDbUserId();

        if (!userId) {
            // Handle the case where userId is null, e.g., return an empty array or throw an error
            return [];
        }

        // get 3 random users from the database excluding the current user and user's we follow
        const randomUsers = await prisma.user.findMany({
            where: {
                AND: [
                    { NOT: { id: userId } }, // Exclude current user
                    {
                        NOT: {
                            followers: {
                                // 'some' is used to check if the userId exists in the followers relation
                                some: {
                                    followerId: userId // Exclude users we follow
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                    }
                }
            },
            take: 3, // Limit to 3 random users
        })
        return randomUsers;

    } catch (error) {
        console.error("Error fetching random users:", error);
        throw new Error("Failed to fetch random users");
    }
}