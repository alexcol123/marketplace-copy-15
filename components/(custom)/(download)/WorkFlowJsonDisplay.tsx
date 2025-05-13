"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Code, Eye, EyeOff, FileCode } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { JsonObject, JsonValue } from "@prisma/client/runtime/library";
import { getFormattedWorkflow } from "@/utils/functions/getFormattedWorkflow";

import { WorkflowJsonDownloadButton } from "./WorkflowJsonDownloadButton";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

interface WorkflowJsonDisplayProps {
  workflowContent: string | JsonObject | JsonValue;
  title?: string;
  workflowId :string
}

const WorkflowJsonDisplay = ({
  workflowId,
  workflowContent,
  title = "Workflow",
}: WorkflowJsonDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { isSignedIn } = useAuth();

  // Format the workflow JSON for display
  const formattedWorkflow = getFormattedWorkflow(workflowContent);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedWorkflow);
      setCopied(true);
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
      toast.error("Failed to copy text");
    }
  };

  // Get workflow metadata for tags only
  const getWorkflowInfo = () => {
    try {
      const data =
        typeof workflowContent === "string"
          ? JSON.parse(workflowContent)
          : workflowContent;

      return {
        name: data.name || "Unnamed Workflow",
        tags: Array.isArray(data.tags) ? data.tags : [],
      };
    } catch (error) {
      console.log(error);
      return {
        name: "Unknown Workflow",
        tags: [],
      };
    }
  };

  const workflowInfo = getWorkflowInfo();

  return (
    <Card className="border-primary/20 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border-b border-primary/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/15 rounded-full shadow-md">
            <FileCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              {title}
            </CardTitle>
            <CardDescription className="mt-1 text-muted-foreground/90">
              Import this automation into your n8n workflow editor
            </CardDescription>
          </div>
        </div>
        
        {/* Display tags if available */}
        {workflowInfo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
            {workflowInfo.tags.map((tag: string, index: number) => (
              <Badge 
              key={index} 
              className="bg-primary/10 text-primary border-primary/20"
              >
              {tag}
              </Badge>
            ))}
            </div>
        )}
      </CardHeader>

      <CardContent className="pt-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {isSignedIn && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
                className="gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all duration-200"
              >
                {isVisible ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Hide JSON</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>View JSON</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all duration-200"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
            </>
          )}

          <WorkflowJsonDownloadButton
          workflowId={workflowId}
            workflowContent={workflowContent}
            title={title}
          />
        </div>

        {isVisible && (
          <div className="border rounded-lg overflow-hidden bg-muted/5 border-primary/10 shadow-md">
            <div className="bg-primary/10 px-4 py-2.5 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center">
                <Code className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium">Workflow Definition</span>
              </div>
              <Badge
                variant="outline"
                className="text-xs font-mono bg-primary/5 border-primary/20"
              >
                JSON
              </Badge>
            </div>
            <ScrollArea className="h-72 w-full">
              <pre className="p-4 text-sm font-mono whitespace-pre overflow-auto bg-gradient-to-b from-transparent to-muted/5">
                {formattedWorkflow}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowJsonDisplay;