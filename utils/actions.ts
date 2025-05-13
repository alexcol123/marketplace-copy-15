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

const renderError = (error: unknown): { message: string; success: boolean } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "An error occurred",
    success: false,
  };
};

export async function checkUsernameAvailability(username: string): Promise<{
  available: boolean;
  message: string;
}> {
  // Don't check if username is less than minimum length
  if (!username || username.length < 3) {
    return {
      available: false,
      message: "Username must be at least 3 characters",
    };
  }

  // Validate username format
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      available: false,
      message: "Username can only contain letters, numbers, and underscores",
    };
  }

  try {
    // Get current user to exclude their existing username
    const user = await currentUser();

    // Check if username exists in database
    const existingUser = await db.profile.findUnique({
      where: {
        username: username,
      },
      select: {
        clerkId: true,
      },
    });

    // If username exists but belongs to the current user, it's still "available"
    if (existingUser && user && existingUser.clerkId === user.id) {
      return {
        available: true,
        message: "This is your current username",
      };
    }

    // If username exists and belongs to another user
    if (existingUser) {
      return {
        available: false,
        message: "This username is already taken",
      };
    }

    // Username is available
    return {
      available: true,
      message: "Username is available!",
    };
  } catch (error) {
    console.error("Error checking username availability:", error);
    return {
      available: false,
      message: "Error checking username availability",
    };
  }
}

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

    // Check if username is already taken
    const usernameCheck = await checkUsernameAvailability(
      validatedFields.username
    );
    if (!usernameCheck.available) {
      return {
        message: usernameCheck.message,
        success: false,
      };
    }

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
): Promise<{ message: string; success?: boolean }> => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    // Check if the username has changed
    const currentProfile = await db.profile.findUnique({
      where: { clerkId: user.id },
      select: { username: true },
    });

    if (
      currentProfile &&
      validatedFields.username !== currentProfile.username
    ) {
      // Username has changed, check availability
      const usernameCheck = await checkUsernameAvailability(
        validatedFields.username
      );
      if (!usernameCheck.available) {
        return {
          message: usernameCheck.message,
          success: false,
        };
      }
    }

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields,
    });

    revalidatePath("/profile");
    return { message: "Profile updated successfully", success: true };
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

    console.log(file);

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

  redirect("/dashboard/wf");
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
      viewCount: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
    const workflow = await db.workflow.update({
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

    return workflow;
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
          },
        },
      },
      orderBy: {
        downloadedAt: "desc",
      },
    });

    return downloads;
  } catch (error) {
    return renderError(error);
  }
};

export const deleteWorkflowAction = async (
  prevState: Record<string, unknown>,
  formData: FormData | { workflowId: string }
): Promise<{ message: string; success: boolean }> => {
  try {
    // Get the authenticated user
    const user = await getAuthUser();

    // Get workflow ID from either FormData or direct object
    const workflowId =
      formData instanceof FormData
        ? (formData.get("workflowId") as string)
        : formData.workflowId;

    if (!workflowId) {
      throw new Error("Workflow ID is required");
    }

    // Get the workflow to check ownership and retrieve image URL
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        authorId: true,
        workflowImage: true,
        title: true,
        slug: true,
      },
    });

    // Check if workflow exists
    if (!workflow) {
      return { message: "No workflow found with that id ", success: false };
    }

    // Verify ownership - check if the authenticated user created this workflow
    if (workflow.authorId !== user.id) {
      return {
        message: "You do not have permission to delete this workflow",
        success: false,
      };
    }

    // Second step: Delete the workflow from the database
    // This will cascade delete related records based on your schema relationships
    await db.workflow.delete({
      where: { id: workflowId },
    });

    // Revalidate relevant paths to update the UI
    revalidatePath("/dashboard/wf"); // My Workflows page
    revalidatePath("/"); // Home page that might show the workflows

    // Return success message
    return {
      message: `"${workflow.title}" was successfully deleted`,
      success: true,
    };
  } catch (error) {
    return renderError(error);
  }
};

// Add this to utils/actions.ts

// Leaderboard data types
interface TopDownloadedWorkflow {
  id: string;
  title: string;
  authorName: string;
  authorProfileImage: string;
  _count: {
    downloads: number;
  };
}

interface TopContributor {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  workflowCount: number;
}

interface TrendingWorkflow {
  id: string;
  title: string;
  authorName: string;
  authorProfileImage: string;
  recentViews: number;
}

interface LeaderboardData {
  topDownloadedWorkflows: TopDownloadedWorkflow[];
  topWorkflowCreators: TopContributor[];
  trendingThisMonth: TrendingWorkflow[];
}

// Function to fetch leaderboard data
export const getLeaderboardData = async (): Promise<LeaderboardData> => {
  try {
    // Get top downloaded workflows
    const topDownloadedWorkflows = await db.workflow.findMany({
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            downloads: true,
          },
        },
      },
      orderBy: {
        downloads: {
          _count: "desc",
        },
      },
    });

    // Get top workflow creators
    const topWorkflowCreators = await db.profile.findMany({
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profileImage: true,
        _count: {
          select: {
            Workflow: true,
          },
        },
      },
      orderBy: {
        Workflow: {
          _count: "desc",
        },
      },
    });

    // Get trending workflows this month
    // First get the date for the beginning of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find workflows with the most views in the current month
    const trendingThisMonth = await db.workflow.findMany({
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true, // This is used as a proxy for monthly views
        author: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      where: {
        updatedAt: {
          gte: startOfMonth,
        },
      },
      orderBy: {
        viewCount: "desc",
      },
    });

    // Format the data for the component
    return {
      topDownloadedWorkflows: topDownloadedWorkflows.map((workflow) => ({
        id: workflow.slug, // Using slug as ID for URL construction
        title: workflow.title,
        authorName: `${workflow.author.firstName} ${workflow.author.lastName}`,
        authorProfileImage: workflow.author.profileImage,
        _count: {
          downloads: workflow._count.downloads,
        },
      })),

      topWorkflowCreators: topWorkflowCreators.map((creator) => ({
        id: creator.id,
        name: `${creator.firstName} ${creator.lastName}`,
        username: creator.username,
        profileImage: creator.profileImage,
        workflowCount: creator._count.Workflow,
      })),

      trendingThisMonth: trendingThisMonth.map((workflow) => ({
        id: workflow.slug, // Using slug as ID for URL construction
        title: workflow.title,
        authorName: `${workflow.author.firstName} ${workflow.author.lastName}`,
        authorProfileImage: workflow.author.profileImage,
        recentViews: workflow.viewCount, // Using viewCount as proxy for monthly views
      })),
    };
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);

    // Return empty data in case of error
    return {
      topDownloadedWorkflows: [],
      topWorkflowCreators: [],
      trendingThisMonth: [],
    };
  }
};

export const getUserProfileWithWorkflows = async (username: string) => {
  console.log("start=====================");
  console.log(username);
  console.log("end=============================================");
  try {
    // Find the user profile by username
    const profile = await db.profile.findFirst({
      where: {
        username: username,
      },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        profileImage: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            Workflow: true,
          },
        },
        Workflow: {
          select: {
            id: true,
            slug: true,
            title: true,
            category: true,
            workflowImage: true,
            viewCount: true,
            createdAt: true,
            _count: {
              select: {
                downloads: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc", // Most recent first
          },
        },
      },
    });

    // Return null if profile doesn't exist
    if (!profile) {
      return null;
    }

    // Calculate total downloads across all workflows
    const totalDownloads = profile.Workflow.reduce(
      (sum, workflow) => sum + workflow._count.downloads,
      0
    );

    // Return formatted user profile data
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      email: profile.email,
      profileImage: profile.profileImage,
      bio: profile.bio,
      createdAt: profile.createdAt,
      totalWorkflows: profile._count.Workflow,
      totalDownloads: totalDownloads,
      workflows: profile.Workflow,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
