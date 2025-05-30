"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, Trophy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import {
  recordWorkflowCompletion,
  checkWorkflowCompletion,
  removeWorkflowCompletion,
} from "@/utils/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface MarkCompletedButtonProps {
  workflowId: string;
  workflowTitle?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showRemoveOption?: boolean; // Whether to show "Remove completion" option
}

export default function MarkCompletedButton({
  workflowId,
  workflowTitle = "this workflow",
  variant = "default",
  size = "default",
  className = "",
  showRemoveOption = true,
}: MarkCompletedButtonProps) {
  const { isSignedIn } = useAuth();

  // Component state
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Check completion status on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!isSignedIn) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        const result = await checkWorkflowCompletion(workflowId);
        setIsCompleted(result.isCompleted);
        setCompletedAt(
          result.completedAt ? new Date(result.completedAt) : null
        );
      } catch (error) {
        console.error("Error checking completion status:", error);
        toast.error("Failed to check completion status");
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [workflowId, isSignedIn]);

  // Handle marking as completed
  const handleMarkCompleted = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to mark workflows as completed");
      return;
    }

    setIsLoading(true);
    try {
      const result = await recordWorkflowCompletion(workflowId);

      if (result.success) {
        setIsCompleted(true);
        setCompletedAt(new Date(result.completedAt));
        toast.success(result.message, {
          icon: "🎉",
          duration: 4000,
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error marking workflow as completed:", error);
      toast.error("Failed to mark workflow as completed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing completion
  const handleRemoveCompletion = async () => {
    setIsLoading(true);
    try {
      const result = await removeWorkflowCompletion(workflowId);

      if (result.success) {
        setIsCompleted(false);
        setCompletedAt(null);
        setShowRemoveDialog(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error removing completion:", error);
      toast.error("Failed to remove completion");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if user is not signed in
  if (!isSignedIn) {
    return (
      <div className="text-center p-4 bg-muted/20 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground mb-3">
          Sign in to track your workflow completions
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="/sign-in">Sign In</a>
        </Button>
      </div>
    );
  }

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Checking status...
      </Button>
    );
  }

  // If completed, show completed state with optional remove option
  if (isCompleted) {
    return (
      <div className="space-y-3">
        {/* Completed status display */}
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Workflow Completed!
              </p>
              {completedAt && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Completed{" "}
                  {formatDistanceToNow(completedAt, { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Done
          </Badge>
        </div>

        {/* Remove completion option */}
        {showRemoveOption && (
          <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Mark as incomplete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Remove Completion Status</DialogTitle>
                <DialogDescription>
                  Are you sure you want to mark "{workflowTitle}" as incomplete?
                  This will remove it from your completed workflows list.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => setShowRemoveDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemoveCompletion}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Mark Incomplete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Default state - not completed
  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} group`}
      onClick={handleMarkCompleted}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Marking as completed...
        </>
      ) : (
        <>
          <Circle className="h-4 w-4 mr-2 group-hover:text-green-500 transition-colors" />
          Mark as Completed
        </>
      )}
    </Button>
  );
}
