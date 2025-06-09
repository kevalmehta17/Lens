"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl: string) {
    try {
        const userId = await getDbUserId();

        if (!userId) return;

        const post = await prisma.post.create({
            data: {
                content,
                image: imageUrl,
                authorId: userId,
            },

        });
        // Revalidate the home page to show the new post
        revalidatePath("/")
        return { success: true, post };

    } catch (error) {
        console.error("Error creating post:", error);
        return { success: false, error: "Failed to create post" };

    }
}