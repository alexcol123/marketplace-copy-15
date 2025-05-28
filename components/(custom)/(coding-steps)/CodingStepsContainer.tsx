import { processWorkflowForWebsite } from "@/utils/functions/workflowInstructions";
import { JsonObject, JsonValue } from "@prisma/client/runtime/library";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Code2,
  Link,
  Zap,
  FileCode,
  Info,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import CodingSteps from "./CodingSteps";
import AISteps from "./AISteps";
import HttpSteps from "./HttpSteps";

// Workflow JSON props type
export type WorkflowJsonProps = {
  workflowJson: string | JsonObject | JsonValue;
}

// Individual code step type
export type CodeStepType = {
  title: string;
  description: string;
  jsCode: string;
  copyableContent: string;
}

// Individual langchain/AI step type
export type LangchainStepType = {
  title: string;
  description: string;
  prompt?: string;
  model?: string;
  parameters: string;
  expectedOutput?: string;
  type: string;
  category?: string;
  aiProvider?: string;
  copyableContent?: {
    prompt?: string | Record<string, unknown>;
    systemMessage?: string;
    modelConfig?: Record<string, unknown>;
  };
}

// Individual HTTP step type
export type HttpStepType = {
  title: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
  expectedResponse?: string;
}

// Array types
export type CodeSteps = CodeStepType[];
export type LangchainSteps = LangchainStepType[];
export type HttpSteps = HttpStepType[];

// Workflow data structure type
export type WorkflowDataType = {
  data: {
    codeSteps: CodeSteps;
    aiSteps: LangchainSteps;
    httpSteps: HttpSteps;
    [key: string]: unknown; // Allow for additional properties
  };
  [key: string]: unknown; // Allow for additional root properties
}

// Component props types for child components
export type CodingStepsProps = {
  workflowJson: CodeSteps;
}

export type AIStepsProps = {
  workflowJson: LangchainSteps;
}

export type HttpStepsProps = {
  workflowJson: HttpSteps;
}

// Main container component props
export type CodingStepsContainerProps = WorkflowJsonProps;

const CodingStepsContainer = ({ workflowJson }: WorkflowJsonProps) => {
  // Type assertion for the function return value to ensure it matches our expected structure
  const workflowData = processWorkflowForWebsite(workflowJson) as WorkflowDataType;

  const codeSteps: CodeSteps = workflowData?.data?.codeSteps || [];
  const langchainSteps: LangchainSteps = workflowData?.data?.aiSteps || [];
  const httpSteps: HttpSteps = workflowData?.data?.httpSteps || [];

  console.log(codeSteps);

  // Count total steps across all categories
  const totalSteps: number =
    (codeSteps?.length || 0) +
    (langchainSteps?.length || 0) +
    (httpSteps?.length || 0);

  // Helper to check if a section has content - fixed type
  const hasContent = (steps: CodeSteps | LangchainSteps | HttpSteps | undefined): boolean =>
    Boolean(steps && Array.isArray(steps) && steps.length > 0);

  return (
    <section className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/15 rounded-full shadow-md">
            <FileCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary">
              Implementation Guide
            </h2>
            <p className="text-muted-foreground mt-1">
              Step-by-step coding instructions for this workflow
            </p>
          </div>
        </div>

        {/* Stats Section */}
        {totalSteps > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="bg-primary/5 border-primary/20 text-primary font-medium px-3 py-1"
            >
              <CheckCircle2 className="h-3 w-3 mr-1.5" />
              {totalSteps} Total Steps
            </Badge>

            {hasContent(langchainSteps) && (
              <Badge
                variant="outline"
                className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
              >
                <Zap className="h-3 w-3 mr-1.5" />
                LangChain: {langchainSteps.length}
              </Badge>
            )}

            {hasContent(codeSteps) && (
              <Badge
                variant="outline"
                className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
              >
                <Code2 className="h-3 w-3 mr-1.5" />
                Code: {codeSteps.length}
              </Badge>
            )}

            {hasContent(httpSteps) && (
              <Badge
                variant="outline"
                className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              >
                <Link className="h-3 w-3 mr-1.5" />
                HTTP: {httpSteps.length}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content Sections */}
      {totalSteps === 0 ? (
        // No steps available
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Info className="h-8 w-8 text-primary/70" />
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              No Implementation Steps Available
            </h3>
            <p className="text-muted-foreground max-w-md">
              This workflow doesn&apos;t contain specific coding instructions. You
              can still download the n8n workflow JSON and import it directly.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* LangChain Steps Section */}
          {hasContent(langchainSteps) && (
            <Card className="border-purple-200/50 dark:border-purple-800/50 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20 border-b border-purple-200/50 dark:border-purple-800/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <span className="text-lg font-bold">
                      LangChain Integration
                    </span>
                    <p className="text-sm text-muted-foreground font-normal mt-1">
                      AI and language model implementation steps
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-500 ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AISteps workflowJson={langchainSteps} />
              </CardContent>
            </Card>
          )}

          {/* Code Steps Section */}
          {hasContent(codeSteps) && (
            <Card className="border-blue-200/50 dark:border-blue-800/50 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20 border-b border-blue-200/50 dark:border-blue-800/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="text-lg font-bold">
                      Custom Code Implementation
                    </span>
                    <p className="text-sm text-muted-foreground font-normal mt-1">
                      Programming logic and custom functions
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-500 ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <CodingSteps workflowJson={codeSteps} />
              </CardContent>
            </Card>
          )}

          {/* HTTP Steps Section */}
          {hasContent(httpSteps) && (
            <Card className="border-green-200/50 dark:border-green-800/50 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20 border-b border-green-200/50 dark:border-green-800/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <Link className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <span className="text-lg font-bold">
                      API & HTTP Requests
                    </span>
                    <p className="text-sm text-muted-foreground font-normal mt-1">
                      External service integrations and webhooks
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-500 ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <HttpSteps workflowJson={httpSteps} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </section>
  );
};

export default CodingStepsContainer;