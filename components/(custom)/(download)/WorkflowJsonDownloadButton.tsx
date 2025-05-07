// components/(custom)/(download)/WorkflowJsonDownloadButton.tsx
"use client";

import { getFormattedWorkflow } from "@/utils/functions/getFormattedWorkflow";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { handleDownload } from "@/utils/functions/handleDownload";
import { JsonObject, JsonValue } from "@prisma/client/runtime/library";
import { recordWorkflowDownload } from "@/utils/actions";
import { toast } from "sonner";

interface WorkflowJsonDownloadButtonProps {
  workflowContent: string | JsonValue | JsonObject;
  workflowId: string; // Add this parameter
  title?: string;
}

export const WorkflowJsonDownloadButton = ({
  workflowContent,
  workflowId, // Accept the workflow ID
  title = "n8n-Workflow",
}: WorkflowJsonDownloadButtonProps) => {
  const formattedWorkflow = getFormattedWorkflow(workflowContent);

  // Updated function to handle download and record it
  const handleDownloadAndRecord = async () => {
    // First handle the actual download
    handleDownload(formattedWorkflow, title);
    
    // Then record the download in the database
    try {
      const result = await recordWorkflowDownload(workflowId);
      if (result.message) {
        toast.success("Workflow added to your downloads");
      }
    } catch (error) {
      console.error("Failed to record download:", error);
      // Still allow the download even if recording fails
    }
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleDownloadAndRecord}
      className="gap-1.5 ml-auto"
    >
      <Download className="h-4 w-4" />
      <span>Download Workflow</span>
    </Button>
  );
};