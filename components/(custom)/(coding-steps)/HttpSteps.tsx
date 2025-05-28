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
  Link,
  ChevronDown,
  ChevronRight,
  Globe,
  FileCode,
  Send,
  ArrowRight,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

// Import types from the container component
import { HttpStepsProps, HttpStepType } from "./CodingStepsContainer";

// Extended type for HTTP steps with additional properties that might exist
type ExtendedHttpStepType = HttpStepType & {
  type?: string;
  category?: string;
  httpMethod?: string;
  endpoint?: string;
  authentication?: Record<string, unknown>;
  parameters?: string; // JSON string
  requestConfig?: Record<string, unknown>;
};



// Props type for the HttpSteps component
type HttpStepsComponentProps = HttpStepsProps;

// Props for the CodeBlock subcomponent
type CodeBlockProps = {
  code: string;
  index: string;
  title: string;
  language?: string;
};

// Props for the StepContent subcomponent
type StepContentProps = {
  step: ExtendedHttpStepType;
  stepIndex: number;
};

const HttpSteps = ({ workflowJson }: HttpStepsComponentProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set<number>());

  const httpSteps = workflowJson as ExtendedHttpStepType[];

  const copyToClipboard = async (text: string, index: string): Promise<void> => {
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

  const getMethodColor = (method: string | undefined): string => {
    if (!method) return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'POST':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'PUT':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
      case 'DELETE':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      case 'PATCH':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getMethodIcon = (method: string | undefined): JSX.Element => {
    if (!method) return <Globe className="h-4 w-4" />;
    
    switch (method.toUpperCase()) {
      case 'GET':
        return <ArrowRight className="h-4 w-4" />;
      case 'POST':
        return <Send className="h-4 w-4" />;
      case 'PUT':
        return <Settings className="h-4 w-4" />;
      case 'DELETE':
        return <Settings className="h-4 w-4" />;
      case 'PATCH':
        return <Settings className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const CodeBlock = ({ 
    code, 
    index, 
    title, 
    language = "json" 
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
    const hasUrl = step.url;
    const hasHeaders = step.headers && Object.keys(step.headers).length > 0;
    const hasBody = step.body;
    const hasParameters = step.parameters;
    
    // If no additional content, just show basic info
    if (!hasUrl && !hasHeaders && !hasBody && !hasParameters) {
      return (
        <div className="p-6 border-t border-primary/10">
          <div className="text-center text-muted-foreground">
            No additional configuration details available for this HTTP request.
          </div>
        </div>
      );
    }

    return (
      <div className="border-t border-primary/10">
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              {hasHeaders && (
                <TabsTrigger value="headers" className="flex-1">
                  Headers
                </TabsTrigger>
              )}
              {hasBody && (
                <TabsTrigger value="body" className="flex-1">
                  Request Body
                </TabsTrigger>
              )}
              {hasParameters && (
                <TabsTrigger value="config" className="flex-1">
                  Configuration
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`font-mono ${getMethodColor(step.method)} px-3 py-1`}
                  >
                    {getMethodIcon(step.method)}
                    <span className="ml-2">{step.method?.toUpperCase() || 'UNKNOWN'}</span>
                  </Badge>
                  {step.url && (
                    <code className="bg-muted px-2 py-1 rounded text-sm flex-1 truncate">
                      {step.url}
                    </code>
                  )}
                </div>
                {step.description && (
                  <p className="text-muted-foreground">{step.description}</p>
                )}
              </div>
            </TabsContent>

            {hasHeaders && (
              <TabsContent value="headers" className="mt-0">
                <CodeBlock
                  code={JSON.stringify(step.headers, null, 2)}
                  index={stepIndex.toString()}
                  title="Request Headers"
                  language="json"
                />
              </TabsContent>
            )}

            {hasBody && (
              <TabsContent value="body" className="mt-0">
                <CodeBlock
                  code={
                    typeof step.body === "string"
                      ? step.body
                      : JSON.stringify(step.body, null, 2)
                  }
                  index={stepIndex.toString()}
                  title="Request Body"
                  language={typeof step.body === "string" ? "text" : "json"}
                />
              </TabsContent>
            )}

            {hasParameters && (
              <TabsContent value="config" className="mt-0">
                <CodeBlock
        code={step.parameters || '{}'}
                  index={stepIndex.toString()}
                  title="Full Configuration"
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
      {httpSteps && httpSteps.length > 0 ? (
        <div className="space-y-4">
          {httpSteps.map((step: ExtendedHttpStepType, index: number) => (
            <Card
              key={index}
              className="border-green-200/50 dark:border-green-800/50 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <CardHeader
                className="cursor-pointer hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors p-4"
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
                    <Link className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="flex-grow">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {step.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`font-mono text-xs ${getMethodColor(step.method)}`}
                        >
                          {step.method?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                        {step.category && (
                          <Badge variant="secondary" className="text-xs">
                            {step.category}
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
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-full mb-4">
              <Link className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No HTTP Steps Found
            </h3>
            <p className="text-muted-foreground max-w-md">
              This workflow doesn&apos;t contain any HTTP requests or API integrations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HttpSteps;