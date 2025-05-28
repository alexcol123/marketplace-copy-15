// components/(custom)/(coding-steps)/HttpSteps.tsx
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
  Terminal,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// Import types from the container component
import { HttpStepsProps, HttpStepType } from "./CodingStepsContainer";

// Props for the CodeBlock subcomponent
type CodeBlockProps = {
  code: string;
  index: string;
  title: string;
  language?: string;
};

// Props for the StepContent subcomponent
type StepContentProps = {
  step: HttpStepType;
  stepIndex: number;
};

const HttpSteps = ({ workflowJson }: HttpStepsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set<number>());

  const httpSteps = workflowJson;

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

  const getBodyTypeLabel = (bodyType: string | undefined) => {
    switch (bodyType) {
      case "json":
        return { label: "JSON", color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300" };
      case "form":
        return { label: "Form Data", color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" };
      case "multipart":
        return { label: "Multipart", color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300" };
      case "urlencoded":
        return { label: "URL Encoded", color: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300" };
      case "none":
        return { label: "No Body", color: "bg-muted/50 border-muted text-muted-foreground" };
      default:
        return { label: "Other", color: "bg-muted/50 border-muted text-muted-foreground" };
    }
  };

  const extractDomain = (url: string | undefined): string => {
    if (!url) return "Unknown";
    try {
      const cleanUrl = url.startsWith("=") ? url.substring(1) : url;
      const firstPart = cleanUrl.split("{{")[0];
      if (
        !firstPart ||
        (!firstPart.startsWith("http:") && !firstPart.startsWith("https:"))
      ) {
        const domainMatch = cleanUrl.match(/https?:\/\/([^\/{{}}]+)/);
        if (domainMatch && domainMatch[1]) return domainMatch[1];
        throw new Error(
          "Cannot determine domain from partial URL or expression"
        );
      }
      const urlObj = new URL(firstPart);
      return urlObj.hostname;
    } catch {
      const parts = url.replace(/^=?(https?:\/\/)?/, "").split("/");
      return parts[0] || url;
    }
  };

  const generateCurlCommand = (step: HttpStepType): string => {
    if (!step.url && !step.copyableContent?.url) return 'curl "URL_NOT_SPECIFIED"';

    const method = step.method || "GET";
    let curl = `curl -X ${method}`;

    // Clean URL - remove leading = and handle n8n expressions
    let cleanUrl = step.copyableContent?.url || step.url || "";
    if (cleanUrl.startsWith("=")) {
      cleanUrl = cleanUrl.substring(1);
    }
    curl += ` "${cleanUrl}"`;

    // Add authentication placeholder if authentication is detected
    if (
      step.parameters &&
      JSON.stringify(step.parameters).includes("authentication")
    ) {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY_HERE"`;
    }

    // Handle body data based on method and body type
    const shouldHaveBody = ["POST", "PUT", "PATCH"].includes(
      method.toUpperCase()
    );

    if (shouldHaveBody) {
      // Add appropriate content-type headers
      if (step.bodyType === "json" && (step.copyableContent?.formattedJsonBody || step.copyableContent?.jsonBody)) {
        curl += ` \\\n  -H "Content-Type: application/json"`;

        // Clean JSON body - remove leading =
        let cleanJsonBody = step.copyableContent?.formattedJsonBody || step.copyableContent?.jsonBody || "";
        if (cleanJsonBody.startsWith("=")) {
          cleanJsonBody = cleanJsonBody.substring(1);
        }
        curl += ` \\\n  -d '${cleanJsonBody}'`;
      } else if (step.bodyType === "form" && step.copyableContent?.bodyParameters) {
        curl += ` \\\n  -H "Content-Type: application/x-www-form-urlencoded"`;

        try {
          const bodyParams = JSON.parse(step.copyableContent.bodyParameters);
          const params = bodyParams.parameters || [];
          const formData = params
            .map((param: any) => {
              // Clean parameter values - remove leading = if present
              let value = param.value;
              if (typeof value === "string" && value.startsWith("=")) {
                value = value.substring(1);
              }
              return `${param.name}=${encodeURIComponent(value)}`;
            })
            .join("&");
          curl += ` \\\n  -d "${formData}"`;
        } catch (e) {
          curl += ` \\\n  -d "FORM_DATA_HERE"`;
        }
      } else if (step.bodyType === "multipart") {
        curl += ` \\\n  -H "Content-Type: multipart/form-data"`;
        curl += ` \\\n  -d "MULTIPART_DATA_HERE"`;
      }
    } else if (
      method.toUpperCase() === "GET" &&
      (step.copyableContent?.formattedJsonBody || step.copyableContent?.bodyParameters)
    ) {
      // For GET requests with body data, add a warning comment
      curl += `\n\n# WARNING: This appears to be a GET request with body data.\n# GET requests typically don't have request bodies.\n# Consider using query parameters instead:\n# ${cleanUrl}?param1=value1&param2=value2`;
    }

    return curl;
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
    const hasUrl = step.copyableContent?.url;
    const hasJsonBody = step.copyableContent?.formattedJsonBody || step.copyableContent?.jsonBody;
    const hasBodyParameters = step.copyableContent?.bodyParameters;
    const hasFullConfig = step.copyableContent?.fullParameters || step.parameters;
    
    return (
      <div className="border-t border-primary/10">
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              {hasJsonBody && (
                <TabsTrigger value="body" className="flex-1">
                  Request Body
                </TabsTrigger>
              )}
              {hasBodyParameters && (
                <TabsTrigger value="params" className="flex-1">
                  Parameters
                </TabsTrigger>
              )}
              <TabsTrigger value="curl" className="flex-1">
                cURL Command
              </TabsTrigger>
              {hasFullConfig && (
                <TabsTrigger value="config" className="flex-1">
                  Full Config
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                {/* Request details section */}
                <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Request Details
                  </h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className={getMethodColor(step.method)}>
                      {getMethodIcon(step.method)}
                      <span className="ml-2">{step.method?.toUpperCase() || 'UNKNOWN'}</span>
                    </Badge>
                    {step.bodyType && (
                      <Badge variant="outline" className={getBodyTypeLabel(step.bodyType).color}>
                        {getBodyTypeLabel(step.bodyType).label}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      to {extractDomain(step.url || step.copyableContent?.url)}
                    </span>
                  </div>
                </div>

                {/* URL display */}
                {(step.url || step.copyableContent?.url) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Endpoint URL</h4>
                    <code className="bg-muted px-3 py-2 rounded text-sm block break-all">
                      {step.copyableContent?.url || step.url}
                    </code>
                  </div>
                )}

                {step.description && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Description</h4>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                )}
                
                {/* Quick copy buttons for common items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {step.copyableContent?.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(step.copyableContent?.url || "", `${stepIndex}-url`)}
                      className="justify-start"
                    >
                      {copiedIndex === `${stepIndex}-url` ? (
                        <Check className="h-3 w-3 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-2" />
                      )}
                      Copy URL
                    </Button>
                  )}
                  {step.copyableContent?.method && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(step.copyableContent?.method || "", `${stepIndex}-method`)}
                      className="justify-start"
                    >
                      {copiedIndex === `${stepIndex}-method` ? (
                        <Check className="h-3 w-3 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-2" />
                      )}
                      Copy Method
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {hasJsonBody && (
              <TabsContent value="body" className="mt-0">
                <CodeBlock
                  code={step.copyableContent?.formattedJsonBody || step.copyableContent?.jsonBody || '{}'}
                  index={stepIndex.toString()}
                  title="Request Body"
                  language="json"
                />
              </TabsContent>
            )}

            {hasBodyParameters && (
              <TabsContent value="params" className="mt-0">
                <CodeBlock
                  code={step.copyableContent?.bodyParameters || '{}'}
                  index={stepIndex.toString()}
                  title="Body Parameters"
                  language="json"
                />
              </TabsContent>
            )}

            <TabsContent value="curl" className="mt-0">
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Important Notes:
                  </h4>
                  <ul className="list-disc ml-4 space-y-1 text-amber-700 dark:text-amber-300">
                    <li>
                      Replace all n8n variables like{" "}
                      <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">{`{{ $json.voiceId }}`}</code>{" "}
                      with actual values
                    </li>
                    <li>
                      Replace{" "}
                      <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
                        YOUR_API_KEY_HERE
                      </code>{" "}
                      with your actual API key
                    </li>
                    <li>
                      The leading{" "}
                      <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">=</code> signs
                      have been removed (n8n-specific syntax)
                    </li>
                    {step.method?.toUpperCase() === "GET" &&
                      (step.copyableContent?.formattedJsonBody || step.copyableContent?.bodyParameters) && (
                        <li className="text-red-600 dark:text-red-400 font-medium">
                          This GET request has body data - this is unusual.
                          Consider using query parameters instead.
                        </li>
                      )}
                  </ul>
                </div>
                <div className="relative border border-primary/10 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm font-medium">cURL Command</span>
                      <Badge variant="outline" className="text-xs">
                        bash
                      </Badge>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(generateCurlCommand(step), `${stepIndex}-curl`)}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-8"
                    >
                      {copiedIndex === `${stepIndex}-curl` ? (
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
                      <code>{generateCurlCommand(step)}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            {hasFullConfig && (
              <TabsContent value="config" className="mt-0">
                <CodeBlock
                  code={step.copyableContent?.fullParameters || step.parameters || '{}'}
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
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold">
              HTTP API Steps
            </h3>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
              {httpSteps.length} {httpSteps.length === 1 ? 'request' : 'requests'}
            </Badge>
          </div>

          {httpSteps.map((step: HttpStepType, index: number) => (
            <Card
              key={index}
              className="border-green-200/50 dark:border-green-800/50 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <CardHeader
                className="cursor-pointer hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors p-4"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 hover:bg-transparent flex-shrink-0"
                    >
                      {expandedSteps.has(index) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Link className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 mb-1">
                        <span className="truncate" title={step.title}>
                          {step.title}
                        </span>
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`font-mono text-xs ${getMethodColor(step.method)} flex-shrink-0`}
                        >
                          {getMethodIcon(step.method)}
                          <span className="ml-1">{step.method?.toUpperCase() || 'UNKNOWN'}</span>
                        </Badge>
                        {step.bodyType && (
                          <Badge variant="outline" className={`text-xs ${getBodyTypeLabel(step.bodyType).color} flex-shrink-0`}>
                            {getBodyTypeLabel(step.bodyType).label}
                          </Badge>
                        )}
                      </div>
                      {step.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate" title={step.description}>
                          {step.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 truncate" title={
                        step.url || step.copyableContent?.url 
                          ? `→ ${extractDomain(step.url || step.copyableContent?.url)}` 
                          : "No URL specified"
                      }>
                        {step.url || step.copyableContent?.url 
                          ? `→ ${extractDomain(step.url || step.copyableContent?.url)}` 
                          : "No URL specified"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-4 flex-shrink-0">
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