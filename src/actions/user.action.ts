"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
    try {
        const { userId } = await auth();     // Gets the current user’s ID (from JWT/session)
        const user = await currentUser();    // Gets the user’s profile (from Clerk API)
        if (!user || !userId) return;

        // Check if the user already exists in the database
        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        })
        if (existingUser) {
            return existingUser; // If user exists, return the existing user
        }

        // If user does not exist, create a new user in the database
        const dbUser = await prisma.user.create({
            data: {
                id: userId,
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