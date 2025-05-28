// components/(custom)/(coding-steps)/AISteps.tsx
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
  Bot,
  ChevronDown,
  ChevronRight,
  FileCode,
  Sparkles,
  MessageSquare,
  Brain,
} from "lucide-react";
import { toast } from "sonner";

// Import types from the container component
import { AIStepsProps, AIStepType } from "./CodingStepsContainer";

// Props for the CodeBlock subcomponent
type CodeBlockProps = {
  code: string;
  index: string;
  title: string;
  language?: string;
};

// Props for the StepContent subcomponent
type StepContentProps = {
  step: AIStepType;
  stepIndex: number;
};

const AISteps = ({ workflowJson }: AIStepsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set<number>());

  const aiSteps = workflowJson;

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

  const getProviderColor = (provider: string | undefined): string => {
    if (!provider) return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'anthropic':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800';
      case 'google':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
    }
  };

  const getCategoryIcon = (category: string | undefined): JSX.Element => {
    if (!category) return <Bot className="h-4 w-4" />;
    
    switch (category.toLowerCase()) {
      case 'chat ai model':
        return <MessageSquare className="h-4 w-4" />;
      case 'ai text generation':
        return <FileCode className="h-4 w-4" />;
      case 'ai agent':
        return <Brain className="h-4 w-4" />;
      case 'ai assistant':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
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
    const hasModelConfig = step.copyableContent?.modelConfig;
    const hasPrompt = step.copyableContent?.prompt;
    const hasSystemMessage = step.copyableContent?.systemMessage;
    const hasFullConfig = step.parameters;
    
    // Generate example implementation code
    const generateImplementationCode = (step: AIStepType): string => {
      if (step.aiProvider === 'OpenAI') {
        return `// OpenAI ${step.category} Implementation
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: "${step.copyableContent?.modelConfig || 'gpt-4'}",
  messages: [${step.copyableContent?.systemMessage ? `
    {
      role: "system",
      content: "${step.copyableContent.systemMessage}"
    },` : ''}
    {
      role: "user",
      content: "${step.copyableContent?.prompt || 'Your prompt here'}"
    }
  ],
  temperature: 0.7,
  max_tokens: 1000
});

console.log(response.choices[0].message.content);`;
      } else if (step.aiProvider === 'Anthropic') {
        return `// Anthropic Claude Implementation
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.create({
  model: "${step.copyableContent?.modelConfig || 'claude-3-sonnet-20240229'}",
  max_tokens: 1000,
  messages: [
    {
      role: "user",
      content: "${step.copyableContent?.prompt || 'Your prompt here'}"
    }
  ]
});

console.log(response.content[0].text);`;
      } else {
        return `// ${step.aiProvider} AI Integration
// Configure your ${step.aiProvider} client
const response = await aiClient.generate({
  model: "${step.copyableContent?.modelConfig || 'default-model'}",
  prompt: "${step.copyableContent?.prompt || 'Your prompt here'}",
  // Add your specific configuration here
});

console.log(response);`;
      }
    };
    
    return (
      <div className="border-t border-primary/10">
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="implementation" className="flex-1">
                Implementation
              </TabsTrigger>
              {(hasPrompt || hasSystemMessage) && (
                <TabsTrigger value="prompts" className="flex-1">
                  Prompts
                </TabsTrigger>
              )}
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
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={`font-mono ${getProviderColor(step.aiProvider)} px-3 py-1`}
                  >
                    {getCategoryIcon(step.category)}
                    <span className="ml-2">{step.aiProvider}</span>
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {step.category}
                  </Badge>
                  {step.copyableContent?.modelConfig && (
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {step.copyableContent.modelConfig}
                    </code>
                  )}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                    💡 What this AI step does:
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {step.category === 'Chat AI Model' && 'Provides interactive conversation capabilities with context awareness and natural language understanding.'}
                    {step.category === 'AI Text Generation' && 'Generates structured text content based on prompts and can output in specific formats like JSON.'}
                    {step.category === 'AI Agent' && 'Acts as an autonomous agent that can reason, plan, and execute tasks with decision-making capabilities.'}
                    {step.category === 'AI Assistant' && 'Provides helpful assistance for various tasks with advanced reasoning and problem-solving abilities.'}
                    {!['Chat AI Model', 'AI Text Generation', 'AI Agent', 'AI Assistant'].includes(step.category) && 'Integrates AI capabilities to enhance the workflow with intelligent processing and decision making.'}
                  </p>
                </div>
                
                {/* Quick copy buttons for common items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {step.copyableContent?.modelConfig && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(step.copyableContent.modelConfig!, `${stepIndex}-model`)}
                      className="justify-start"
                    >
                      {copiedIndex === `${stepIndex}-model` ? (
                        <Check className="h-3 w-3 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-2" />
                      )}
                      Copy Model Config
                    </Button>
                  )}
                  {step.copyableContent?.prompt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(step.copyableContent.prompt!, `${stepIndex}-prompt`)}
                      className="justify-start"
                    >
                      {copiedIndex === `${stepIndex}-prompt` ? (
                        <Check className="h-3 w-3 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-2" />
                      )}
                      Copy Prompt
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="mt-0">
              <CodeBlock
                code={generateImplementationCode(step)}
                index={stepIndex.toString()}
                title={`${step.aiProvider} Implementation`}
                language="javascript"
              />
            </TabsContent>

            {(hasPrompt || hasSystemMessage) && (
              <TabsContent value="prompts" className="mt-0">
                <div className="space-y-4">
                  {hasSystemMessage && (
                    <CodeBlock
                      code={step.copyableContent.systemMessage || ''}
                      index={stepIndex.toString()}
                      title="System Message"
                      language="text"
                    />
                  )}
                  {hasPrompt && (
                    <CodeBlock
                      code={step.copyableContent.prompt || ''}
                      index={stepIndex.toString()}
                      title="User Prompt"
                      language="text"
                    />
                  )}
                </div>
              </TabsContent>
            )}

            {hasFullConfig && (
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
      {aiSteps && aiSteps.length > 0 ? (
        <div className="space-y-4">
          {aiSteps.map((step: AIStepType, index: number) => (
            <Card
              key={index}
              className="border-primary/20 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <CardHeader
                className="cursor-pointer hover:bg-primary/5 transition-colors p-4"
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
                    <Bot className="h-5 w-5 text-primary" />
                    <div className="flex-grow">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {step.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`font-mono text-xs ${getProviderColor(step.aiProvider)}`}
                        >
                          {step.aiProvider}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {step.category}
                        </Badge>
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
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No AI Steps Found
            </h3>
            <p className="text-muted-foreground max-w-md">
              This workflow doesn&apos;t contain any AI integration steps to learn from.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISteps;