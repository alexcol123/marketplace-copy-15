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
  Settings,
  Zap,
  Eye,
  AlertTriangle,
  Package,
  Terminal,
  BookOpen,
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

const AISteps = ({ steps }: AIStepsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set<number>());

  const aiSteps = steps;

  // Safely extract string value from n8n's resource locator objects
  const extractValue = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number') return String(obj);
    if (typeof obj === 'boolean') return String(obj);
    
    // Handle n8n resource locator objects
    if (typeof obj === 'object' && obj !== null) {
      if (obj.value !== undefined) return String(obj.value);
      if (obj.cachedResultName !== undefined) return String(obj.cachedResultName);
      if (obj.__rl !== undefined && obj.value !== undefined) return String(obj.value);
      
      // If it's an array, join the elements
      if (Array.isArray(obj)) {
        return obj.map(item => extractValue(item)).join(', ');
      }
      
      // For other objects, stringify them safely
      try {
        return JSON.stringify(obj, null, 2);
      } catch (error) {
        return '[Object]';
      }
    }
    
    return String(obj);
  };

  // Process object to convert resource locators to readable values
  const processResourceLocators = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    // Handle resource locator objects
    if (typeof obj === 'object' && obj !== null && (obj.__rl !== undefined || obj.value !== undefined || obj.cachedResultName !== undefined)) {
      return extractValue(obj);
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => processResourceLocators(item));
    }
    
    // Handle regular objects
    if (typeof obj === 'object' && obj !== null) {
      const processed: any = {};
      for (const [key, value] of Object.entries(obj)) {
        processed[key] = processResourceLocators(value);
      }
      return processed;
    }
    
    return obj;
  };

  // Safely stringify any object/value for display - FIXED VERSION
  const safeStringify = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    
    try {
      // Process the object recursively to handle nested resource locators
      const processedObj = processResourceLocators(value);
      return JSON.stringify(processedObj, null, 2);
    } catch (error) {
      return '[Complex Object]';
    }
  };

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
      case 'gemini':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'mistral':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
      case 'cohere':
        return 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800';
      case 'huggingface':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800';
    }
  };

  const getCategoryIcon = (category: string | undefined): JSX.Element => {
    if (!category) return <Bot className="h-4 w-4" />;
    
    switch (category.toLowerCase()) {
      case 'chat ai model':
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'ai text generation':
      case 'text generation':
        return <FileCode className="h-4 w-4" />;
      case 'ai agent':
      case 'agent':
        return <Brain className="h-4 w-4" />;
      case 'ai assistant':
      case 'assistant':
        return <Sparkles className="h-4 w-4" />;
      case 'ai vision':
      case 'vision':
        return <Eye className="h-4 w-4" />;
      case 'ai tool':
      case 'tool':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  // Analyze AI configuration complexity - FIXED VERSION
  const analyzeAIComplexity = (step: AIStepType): { level: string; color: string; reasons: string[] } => {
    let complexity = 0;
    const reasons: string[] = [];
    
    // Extract values safely before checking them
    const systemMessage = extractValue(step.parameters?.systemMessage);
    const textPrompt = extractValue(step.parameters?.text);
    const messages = step.parameters?.messages;
    const model = extractValue(step.parameters?.model);
    
    // Check configuration parameters using extracted values
    const configStr = safeStringify(step.parameters);
    const hasSystemMessage = systemMessage && systemMessage.length > 100;
    const hasComplexPrompt = textPrompt && textPrompt.length > 200;
    const hasMultipleMessages = messages && Array.isArray(messages) && messages.length > 2;
    const hasAdvancedSettings = /temperature|top_p|max_tokens|frequency_penalty|presence_penalty/.test(configStr);
    const hasFunctionCalling = /functions|tools/.test(configStr);
    const hasCustomModel = model && !['gpt-3.5-turbo', 'gpt-4', 'claude-3-haiku'].includes(model);
    
    if (hasSystemMessage) { complexity += 1; reasons.push('Complex system message'); }
    if (hasComplexPrompt) { complexity += 1; reasons.push('Detailed prompt engineering'); }
    if (hasMultipleMessages) { complexity += 2; reasons.push('Multi-turn conversation'); }
    if (hasAdvancedSettings) { complexity += 2; reasons.push('Advanced model parameters'); }
    if (hasFunctionCalling) { complexity += 3; reasons.push('Function calling/tools'); }
    if (hasCustomModel) { complexity += 1; reasons.push('Custom model configuration'); }
    
    if (complexity <= 2) return { level: 'Simple', color: 'green', reasons };
    if (complexity <= 5) return { level: 'Moderate', color: 'yellow', reasons };
    return { level: 'Advanced', color: 'red', reasons };
  };

  // Check if this is actually an AI-related step (not just Google Drive operations)
  const isActualAIStep = (step: AIStepType): boolean => {
    const actualAITypes = [
      '@n8n/n8n-nodes-langchain.lmChatOpenAi',
      '@n8n/n8n-nodes-langchain.agent',
      '@n8n/n8n-nodes-langchain.openAi',
      'n8n-nodes-base.openAi',
      'n8n-nodes-base.anthropic',
      'n8n-nodes-base.googleAi',
      'n8n-nodes-base.mistral',
      'n8n-nodes-base.cohere'
    ];
    
    return actualAITypes.some(type => step.type?.includes(type)) || 
           (step.aiProvider && !step.type?.includes('googleDrive'));
  };

  // Generate example implementation code - FIXED VERSION
  const generateImplementationCode = (step: AIStepType): string => {
    const modelConfig = extractValue(step.parameters?.model || step.parameters?.modelId) || 'default-model';
    const systemMessage = extractValue(step.parameters?.systemMessage) || '';
    const prompt = extractValue(step.parameters?.text || step.parameters?.messages) || '';

    if (step.aiProvider?.toLowerCase() === 'openai') {
      return `// OpenAI ${step.category} Implementation
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function callOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: "${modelConfig}",
      messages: [${systemMessage ? `
        {
          role: "system",
          content: \`${systemMessage.replace(/`/g, '\\`').replace(/"/g, '\\"')}\`
        },` : ''}
        {
          role: "user",
          content: \`${prompt.replace(/`/g, '\\`').replace(/"/g, '\\"')}\`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

// Usage
const result = await callOpenAI();
console.log(result);`;
    } else if (step.aiProvider?.toLowerCase() === 'anthropic') {
      return `// Anthropic Claude Implementation
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function callClaude() {
  try {
    const response = await anthropic.messages.create({
      model: "${modelConfig}",
      max_tokens: 1000,${systemMessage ? `
      system: \`${systemMessage.replace(/`/g, '\\`').replace(/"/g, '\\"')}\`,` : ''}
      messages: [
        {
          role: "user",
          content: \`${prompt.replace(/`/g, '\\`').replace(/"/g, '\\"')}\`
        }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Anthropic API Error:', error);
    throw error;
  }
}

// Usage
const result = await callClaude();
console.log(result);`;
    } else if (step.aiProvider?.toLowerCase() === 'google' || step.aiProvider?.toLowerCase() === 'gemini') {
      return `// Google Gemini Implementation
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function callGemini() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "${modelConfig}" 
    });

    const promptText = \`${systemMessage ? 
      systemMessage.replace(/`/g, '\\`').replace(/"/g, '\\"') + '\n\n' : 
      ''}${prompt.replace(/`/g, '\\`').replace(/"/g, '\\"')}\`;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

// Usage
const result = await callGemini();
console.log(result);`;
    } else {
      return `// ${step.aiProvider} AI Integration
// Configure your ${step.aiProvider} client
import { ${step.aiProvider}Client } from '${step.aiProvider?.toLowerCase()}-sdk';

const client = new ${step.aiProvider}Client({
  apiKey: process.env.${step.aiProvider?.toUpperCase()}_API_KEY,
});

async function callAI() {
  try {
    const response = await client.generate({
      model: "${modelConfig}",${systemMessage ? `
      systemMessage: \`${systemMessage.replace(/`/g, '\\`').replace(/"/g, '\\"')}\`,` : ''}
      prompt: \`${prompt.replace(/`/g, '\\`').replace(/"/g, '\\"')}\`,
      // Add your specific configuration here
    });

    return response.text || response.content;
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
}

// Usage
const result = await callAI();
console.log(result);`;
    }
  };

  // Generate package.json for AI implementation
  const generatePackageJson = (step: AIStepType): string => {
    const dependencies: string[] = [];
    
    if (step.aiProvider?.toLowerCase() === 'openai') {
      dependencies.push('"openai": "^4.20.0"');
    } else if (step.aiProvider?.toLowerCase() === 'anthropic') {
      dependencies.push('"@anthropic-ai/sdk": "^0.9.0"');
    } else if (step.aiProvider?.toLowerCase() === 'google' || step.aiProvider?.toLowerCase() === 'gemini') {
      dependencies.push('"@google/generative-ai": "^0.2.0"');
    } else if (step.aiProvider?.toLowerCase() === 'cohere') {
      dependencies.push('"cohere-ai": "^7.0.0"');
    } else if (step.aiProvider?.toLowerCase() === 'huggingface') {
      dependencies.push('"@huggingface/inference": "^2.6.0"');
    }
    
    // Common dependencies
    dependencies.push('"dotenv": "^16.3.0"');

    return `{
  "name": "ai-integration-extracted",
  "version": "1.0.0",
  "description": "Extracted AI integration from n8n workflow",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    ${dependencies.join(',\n    ')}
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`;
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
    // Extract values safely before checking them
    const modelConfig = extractValue(step.parameters?.model || step.parameters?.modelId);
    const systemMessage = extractValue(step.parameters?.systemMessage);
    const prompt = extractValue(step.parameters?.text) || safeStringify(step.parameters?.messages);
    
    const hasModelConfig = !!modelConfig;
    const hasPrompt = !!prompt;
    const hasSystemMessage = !!systemMessage;
    const hasFullConfig = !!step.parameters;
    const complexity = analyzeAIComplexity(step);
    
    return (
      <div className="border-t border-primary/10">
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1">
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
              <TabsTrigger value="package" className="flex-1">
                Package.json
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
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      complexity.color === 'green' ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20' :
                      complexity.color === 'yellow' ? 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20' :
                      'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/20'
                    }`}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {complexity.level}
                  </Badge>
                  {modelConfig && (
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {modelConfig}
                    </code>
                  )}
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    What this AI step does:
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    {step.category === 'Chat AI Model' || step.category === 'chat' ? 'Provides interactive conversation capabilities with context awareness and natural language understanding.' :
                     step.category === 'AI Text Generation' || step.category === 'text generation' ? 'Generates structured text content based on prompts and can output in specific formats like JSON.' :
                     step.category === 'AI Agent' || step.category === 'agent' ? 'Acts as an autonomous agent that can reason, plan, and execute tasks with decision-making capabilities.' :
                     step.category === 'AI Assistant' || step.category === 'assistant' ? 'Provides helpful assistance for various tasks with advanced reasoning and problem-solving abilities.' :
                     step.category === 'AI Vision' || step.category === 'vision' ? 'Analyzes and processes images, providing descriptions, object detection, or visual understanding.' :
                     'Integrates AI capabilities to enhance the workflow with intelligent processing and decision making.'}
                  </p>
                </div>

                {complexity.level !== 'Simple' && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Configuration Complexity:
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                      This AI integration is rated as <strong>{complexity.level}</strong> due to:
                    </p>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 list-disc list-inside">
                      {complexity.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Quick copy buttons for common items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {modelConfig && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(modelConfig, `${stepIndex}-model`)}
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
                  {prompt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(prompt, `${stepIndex}-prompt`)}
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
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Integration Notes:
                  </h4>
                  <ul className="list-disc ml-4 space-y-1 text-blue-700 dark:text-blue-300">
                    <li>Replace environment variables with your actual API keys</li>
                    <li>Install required dependencies using npm or yarn</li>
                    <li>Handle rate limits and API errors appropriately</li>
                    <li>Consider implementing retry logic for production use</li>
                    <li>Monitor usage and costs based on your AI provider&apos;s pricing</li>
                  </ul>
                </div>
                <CodeBlock
                  code={generateImplementationCode(step)}
                  index={stepIndex.toString()}
                  title={`${step.aiProvider} Implementation`}
                  language="javascript"
                />
              </div>
            </TabsContent>

            {(hasPrompt || hasSystemMessage) && (
              <TabsContent value="prompts" className="mt-0">
                <div className="space-y-4">
                  {hasSystemMessage && (
                    <CodeBlock
                      code={systemMessage}
                      index={`${stepIndex}-system`}
                      title="System Message"
                      language="text"
                    />
                  )}
                  {hasPrompt && (
                    <CodeBlock
                      code={prompt}
                      index={`${stepIndex}-prompt`}
                      title="User Prompt"
                      language="text"
                    />
                  )}

                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-800 dark:text-green-300">
                      <BookOpen className="h-4 w-4" />
                      Prompt Engineering Tips
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                      <li>• Be specific and clear in your instructions</li>
                      <li>• Use examples to show the desired output format</li>
                      <li>• Break complex tasks into smaller steps</li>
                      <li>• Test different temperature values for creativity vs consistency</li>
                      <li>• Consider token limits when crafting prompts</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            )}

            <TabsContent value="package" className="mt-0">
              <CodeBlock
                code={generatePackageJson(step)}
                index={`${stepIndex}-package`}
                title="Package.json Configuration"
                language="json"
              />
            </TabsContent>

            {hasFullConfig && (
              <TabsContent value="config" className="mt-0">
                <CodeBlock
                  code={safeStringify(step.parameters)}
                  index={`${stepIndex}-config`}
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

  // Filter out non-AI steps
  const actualAISteps = aiSteps.filter(isActualAIStep);

  return (
    <div className="space-y-6">
      {actualAISteps && actualAISteps.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">
              AI Integration Steps
            </h3>
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
              {actualAISteps.length} AI integration{actualAISteps.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {actualAISteps.map((step: AIStepType, index: number) => {
            const complexity = analyzeAIComplexity(step);
            
            return (
              <Card
                key={step.id}
                className="border-purple-200/50 dark:border-purple-800/50 overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <CardHeader
                  className="cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors p-4"
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
                      <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold mb-1">
                          <span className="truncate" title={step.name}>
                            {step.name} ({step.category})
                          </span>
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={`font-mono text-xs ${getProviderColor(step.aiProvider)} flex-shrink-0`}
                          >
                            {getCategoryIcon(step.category)}
                            <span className="ml-1">{step.aiProvider}</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {step.category}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs flex-shrink-0 ${
                              complexity.color === 'green' ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20' :
                              complexity.color === 'yellow' ? 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20' :
                              'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/20'
                            }`}
                          >
                            {complexity.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-4 flex-shrink-0">
                      Step {step.stepNumber}
                    </Badge>
                  </div>
                </CardHeader>

                {expandedSteps.has(index) && (
                  <StepContent step={step} stepIndex={index} />
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-full mb-4">
              <Bot className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No AI Steps Found
            </h3>
            <p className="text-muted-foreground max-w-md">
              This workflow doesn&apos;t contain any AI integration steps to analyze.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISteps;