"use client";

import React, { JSX, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy,
  Check,
  Zap,
  ChevronDown,
  ChevronRight,
  Settings,
  MessageSquare,
  Bot,
  FileCode,
  Brain,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// Import types from the container component
import { LangchainStepType } from "./CodingStepsContainer";

// Extended type for AI steps with additional properties that might exist
type ExtendedLangchainStepType = LangchainStepType & {
  type: string;
  category?: string;
  aiProvider?: string;
  parameters: string; // JSON string
  copyableContent?: {
    prompt?: string | Record<string, unknown>;
    systemMessage?: string;
    modelConfig?: Record<string, unknown>;
  };
};

type ExtendedLangchainSteps = ExtendedLangchainStepType[];

// Props type for the AISteps component
type AIStepsComponentProps = {
  workflowJson: ExtendedLangchainSteps;
};

// Props for the CodeBlock subcomponent
type CodeBlockProps = {
  code: string;
  index: string;
  title: string;
  language?: string;
};

// Props for the StepContent subcomponent
type StepContentProps = {
  step: ExtendedLangchainStepType;
  stepIndex: number;
};

const AISteps = ({ workflowJson }: AIStepsComponentProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set<number>());

  const aiSteps: ExtendedLangchainSteps = workflowJson;

  const copyToClipboard = async (
    text: string,
    index: string
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy code");
    }
  };

  const toggleExpanded = (index: number): void => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const getNodeTypeIcon = (type: string): JSX.Element => {
    if (type.includes("lmChatOpenAi") || type.includes("chat"))
      return <Bot className="text-blue-500" size={20} />;
    if (type.includes("agent"))
      return <Brain className="text-purple-500" size={20} />;
    if (type.includes("openAi") || type.includes("ai"))
      return <Sparkles className="text-green-500" size={20} />;
    if (type.includes("anthropic") || type.includes("claude"))
      return <MessageSquare className="text-orange-500" size={20} />;
    if (type.includes("gemini") || type.includes("google"))
      return <Zap className="text-red-500" size={20} />;
    return <Settings className="text-muted-foreground" size={20} />;
  };

  const getNodeTypeBadgeColor = (type: string): string => {
    if (type.includes("lmChatOpenAi") || type.includes("chat"))
      return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300";
    if (type.includes("agent"))
      return "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300";
    if (type.includes("openAi") || type.includes("ai"))
      return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300";
    if (type.includes("anthropic") || type.includes("claude"))
      return "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300";
    if (type.includes("gemini") || type.includes("google"))
      return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300";
    return "bg-muted/50 border-muted text-muted-foreground";
  };

  const getAIProviderName = (type: string): string => {
    if (type.includes("openAi")) return "OpenAI";
    if (type.includes("anthropic") || type.includes("claude"))
      return "Anthropic";
    if (type.includes("gemini") || type.includes("google")) return "Google";
    if (type.includes("langchain")) return "AI Model";
    return "AI Provider";
  };

  const CodeBlock = ({
    code,
    index,
    title,
    language = "json",
  }: CodeBlockProps): JSX.Element => (
    <div className="relative border border-primary/10 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium">{title}</span>
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
        </div>
        <Button
          onClick={() => copyToClipboard(code, `${index}-${title}`)}
          variant="outline"
          size="sm"
          className="gap-1.5 h-8"
        >
          {copiedIndex === `${index}-${title}` ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <ScrollArea className="h-80">
        <pre className="p-4 text-sm font-mono bg-muted/10 overflow-x-auto">
          <code>{code}</code>
        </pre>
      </ScrollArea>
    </div>
  );

  const StepContent = ({ step, stepIndex }: StepContentProps): JSX.Element => {
    const hasPrompt = step.copyableContent?.prompt;
    const hasSystemMessage = step.copyableContent?.systemMessage;
    const hasModelConfig = step.copyableContent?.modelConfig;

    // If no additional content, just show parameters
    if (!hasPrompt && !hasSystemMessage && !hasModelConfig) {
      return (
        <div className="p-6 border-t border-primary/10">
          <CodeBlock
            code={step.parameters}
            index={stepIndex.toString()}
            title="Full Parameters"
            language="json"
          />
        </div>
      );
    }

    return (
      <div className="border-t border-primary/10">
        <Tabs defaultValue="parameters" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
              <TabsTrigger value="parameters" className="flex-1">
                Parameters
              </TabsTrigger>
              {hasPrompt && (
                <TabsTrigger value="prompt" className="flex-1">
                  Prompt Template
                </TabsTrigger>
              )}
              {hasSystemMessage && (
                <TabsTrigger value="system" className="flex-1">
                  System Message
                </TabsTrigger>
              )}
              {hasModelConfig && (
                <TabsTrigger value="model" className="flex-1">
                  Model Config
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="parameters" className="mt-0">
              <CodeBlock
                code={step.parameters}
                index={stepIndex.toString()}
                title="Full Parameters"
                language="json"
              />
            </TabsContent>

            {hasPrompt && (
              <TabsContent value="prompt" className="mt-0">
                <CodeBlock
                  code={
                    typeof step.copyableContent!.prompt === "string"
                      ? step.copyableContent!.prompt
                      : JSON.stringify(step.copyableContent!.prompt, null, 2)
                  }
                  index={stepIndex.toString()}
                  title="Prompt Template"
                  language="text"
                />
              </TabsContent>
            )}

            {hasSystemMessage && (
              <TabsContent value="system" className="mt-0">
                <CodeBlock
                  code={step.copyableContent!.systemMessage!}
                  index={stepIndex.toString()}
                  title="System Message"
                  language="text"
                />
              </TabsContent>
            )}

            {hasModelConfig && (
              <TabsContent value="model" className="mt-0">
                <CodeBlock
                  code={JSON.stringify(
                    step.copyableContent!.modelConfig,
                    null,
                    2
                  )}
                  index={stepIndex.toString()}
                  title="Model Configuration"
                  language="json"
                />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {aiSteps && aiSteps.length > 0 ? (
        <div className="space-y-4">
          {aiSteps.map((step: ExtendedLangchainStepType, index: number) => (
            <Card
              key={index}
              className="border-purple-200/50 dark:border-purple-800/50 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <CardHeader
                className="cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors p-4"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 hover:bg-transparent"
                    >
                      {expandedSteps.has(index) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    {getNodeTypeIcon(step.type)}
                    <div className="flex-grow">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {step.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className={getNodeTypeBadgeColor(step.type)}
                        >
                          {step.category || getAIProviderName(step.type)}
                        </Badge>
                        {step.aiProvider && (
                          <Badge variant="secondary" className="text-xs">
                            {step.aiProvider}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    Step {index + 1}
                  </Badge>
                </div>
              </CardHeader>

              {expandedSteps.has(index) && (
                <StepContent step={step} stepIndex={index} />
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-full mb-4">
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No AI Steps Found
            </h3>
            <p className="text-muted-foreground max-w-md">
              This workflow doesn&apos;t contain any AI models or language
              processing nodes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISteps;
