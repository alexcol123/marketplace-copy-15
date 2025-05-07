"use server";

import db from "./db";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
// import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  workflowSchema,
  imageSchema,
  profileSchema,
  validateWithZodSchema,
} from "./schemas";
import { revalidatePath } from "next/cache";
import { uploadImage } from "./supabase";

import slug from "slug";
import { CategoryType } from "@prisma/client";
import { getDateTime } from "./functions/getDateTime";

const getAuthUser = async () => {
  const user = await currentUser();

  if (!user) throw new Error(" You must be logged in to access this route ");

  return user;
};

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "An error occurred",
  };
};

export const CreateProfileAction = async (
  prevState: Record<string, unknown>,
  formData: FormData
) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Please login to create a profile");
    }

    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    const userData = {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      profileImage: user.imageUrl ?? "",
      ...validatedFields,
    };

    await db.profile.create({
      data: userData,
    });

    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true,
      },
    });
  } catch (error) {
    return renderError(error);
  }

  redirect("/dashboard");
};

export const fetchProfile = async () => {
  const user = await getAuthUser();
  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  return profile;
};

export const updateProfileAction = async (
  prevState: Record<string, unknown>,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields,
    });

    revalidatePath("/profile");
    return { message: "Profile updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateProfileImageAction = async (
  prevState: Record<string, unknown>,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });

    console.log(validateWithZodSchema);
    const fullPath = await uploadImage(validatedFields.image);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: {
        profileImage: fullPath,
      },
    });
    revalidatePath("/profile");
    return { message: "Profile image updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const createWorkflowAction = async (
  prevState: Record<string, unknown>,
  formData: FormData
): Promise<{ message: string }> => {
  try {
    const user = await getAuthUser();

    // Get form data
    const rawData = Object.fromEntries(formData);
    const file = formData.get("image") as File;

    if (!file || file.size === 0) {
      return { message: "Image file is required" };
    }

    const workflowCreatedAt = getDateTime();

    // Validate the workflow data
    const validatedFields = validateWithZodSchema(workflowSchema, {
      title: rawData.title,
      content: rawData.content,
      category: rawData.category,
      steps: rawData.steps,
    });

    // Validate and process the file
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);

    // Create slug
    const slugContent = `${validatedFields.title} author ${user.firstName} ${user.lastName} date ${workflowCreatedAt}`;
    const slugString = slug(slugContent, { lower: true });

    // Process workflow JSON
    let workFlowJson = {};
    try {
      const workFlowJsonString = rawData.workFlowJson as string;
      if (workFlowJsonString?.trim() && workFlowJsonString !== "{}") {
        workFlowJson = JSON.parse(workFlowJsonString);
      }
    } catch (error) {
      console.error("Error parsing workflow JSON:", error);
    }

    // Process steps
    let steps = [];
    try {
      const stepsString = validatedFields.steps;
      if (stepsString) {
        const parsedSteps = JSON.parse(stepsString);
        if (Array.isArray(parsedSteps)) {
          steps = parsedSteps.filter(
            (step) => typeof step === "string" && step.trim() !== ""
          );
        }
      }
    } catch (error) {
      console.error("Error parsing steps:", error);
    }

    // Create the workflow data
    const workflowData = {
      title: validatedFields.title,
      content: validatedFields.content,
      slug: slugString,
      viewCount: 0,
      workflowImage: fullPath,
      category: validatedFields.category,
      authorId: user.id,
      workFlowJson,
      steps,
    };

    await db.workflow.create({
      data: workflowData,
    });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return {
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }

  redirect("/");
};

export const fetchWorkflows = async ({
  search = "",
  category,
}: {
  search?: string;
  category?: string;
}) => {
  const workflows = await db.workflow.findMany({
    where: {
      category: category as CategoryType | undefined,
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      content: true,
      workflowImage: true,
      authorId: true,
      author: true,
      category: true,
      slug: true,
      viewCount:true
    },
    orderBy: {
      createdAt: "desc",
    },
  });
console.log(workflows[0])

console.log('workflow 0-------------------------------------------------------')

  return workflows;
};

export const fetchSingleWorkflow1 = async (slug: string) => {
  const singleWorkflow = await db.workflow.findUnique({
    where: {
      slug,
    },
    include: {
      author: true,
    },
  });

  return singleWorkflow;
};

export const fetchSingleWorkflow = async (slug: string) => {
  try {
    // Use the update operation. It increments viewCount AND returns the updated workflow.
    const updatedWorkflow = await db.workflow.update({
      where: {
        slug,
      },
      data: {
        viewCount: {
          increment: 1, // Use the increment modifier
        },
      },
      include: {
        author: true, // Still include the author relation
      },
    });

    return updatedWorkflow;
  } catch (error) {
    return renderError(error);
  }
};

export const fetchMyWorkflows = async () => {
  const user = await getAuthUser();

  const workflows = await db.workflow.findMany({
    where: {
      authorId: user.id,
    },
    orderBy: {
      createdAt: "desc", // This sorts by newest first
    },
    include: {
      author: true, // Optionally include author details if needed
    },
  });

  return workflows;
};

export async function getUserWorkflowStats() {
  try {
    // Get the current authenticated user
    const user = await getAuthUser();

    // Fetch all workflows created by the user
    const userWorkflows = await db.workflow.findMany({
      where: {
        authorId: user.id,
      },
      select: {
        id: true,
        viewCount: true,
        category: true,
      },
    });

    // Calculate total workflows
    const totalWorkflows = userWorkflows.length;

    // Calculate total views
    const totalViews = userWorkflows.reduce(
      (sum, workflow) => sum + workflow.viewCount,
      0
    );

    // Count categories
    const categoryCount = new Map<string, number>();

    userWorkflows.forEach((workflow) => {
      const category = workflow.category;
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    // Convert category map to array
    const categoriesUsed = Array.from(categoryCount.entries()).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    // Sort categories by count (highest first)
    categoriesUsed.sort((a, b) => b.count - a.count);

    // Get most used category

    return {
      totalWorkflows,
      totalViews,
      categoriesUsed,
    };
  } catch (error) {
    console.error("Error fetching user workflow stats:", error);
    // Return default values in case of error
    return {
      totalWorkflows: 0,
      totalViews: 0,
      categoriesUsed: [],
    };
  }
}


// Downloads 

// utils/actions.ts
export const recordWorkflowDownload = async (workflowId: string) => {
  try {
    const user = await getAuthUser();
    
    // Create the download record
    await db.workflowDownload.create({
      data: {
        workflowId,
        userId: user.id,
      },
    });
    
    return { message: "Download recorded successfully" };
  } catch (error) {
    return renderError(error);
  }
};


// utils/actions.ts
export const fetchUserDownloads = async () => {
  try {
    const user = await getAuthUser();
    
    const downloads = await db.workflowDownload.findMany({
      where: {
        userId: user.id,
      },
      include: {
        workflow: {
          include: {
            author: true,
          }
        },
      },
      orderBy: {
        downloadedAt: 'desc',
      },
    });
    
    return downloads;
  } catch (error) {
    return renderError(error);
  }
};