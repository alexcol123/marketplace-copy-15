// components/(custom)/(coding-steps)/CodingSteps.tsx
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
  Code,
  ChevronDown,
  ChevronRight,
  FileCode,
  Play,
  Lightbulb,
  AlertTriangle,
  Terminal,
  BookOpen,
  Braces,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// Import types from the container component
import { CodingStepsProps, CodeStepType } from "./CodingStepsContainer";

// Props for the CodeBlock subcomponent
type CodeBlockProps = {
  code: string;
  index: string;
  title: string;
  language?: string;
};

// Props for the StepContent subcomponent
type StepContentProps = {
  step: CodeStepType;
  stepIndex: number;
};

const CodingSteps = ({ steps }: CodingStepsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set<number>());

  const codeSteps = steps;

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

  // Extract functions from code for analysis
  const extractFunctions = (jsCode: string): string[] => {
    const functionRegex = /(?:function\s+(\w+))|(?:(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))|(?:(\w+)\s*:\s*(?:async\s+)?function)|(?:(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>)/g;
    const functions: string[] = [];
    let match;
    
    while ((match = functionRegex.exec(jsCode)) !== null) {
      const funcName = match[1] || match[2] || match[3] || match[4];
      if (funcName && !functions.includes(funcName) && funcName !== 'items') {
        functions.push(funcName);
      }
    }
    
    return functions;
  };

  // Extract main logic description from comments
  const extractLogicDescription = (jsCode: string): string => {
    const lines = jsCode.split('\n');
    const commentBlocks: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('//')) {
        const comment = line.replace('//', '').trim();
        if (comment && !comment.toLowerCase().includes('todo') && !comment.toLowerCase().includes('fixme')) {
          commentBlocks.push(comment);
        }
      } else if (line.startsWith('/*')) {
        let blockComment = line.replace('/*', '').trim();
        while (i < lines.length && !lines[i].includes('*/')) {
          i++;
          if (i < lines.length) {
            const nextLine = lines[i].replace('*/', '').replace(/^\s*\*/, '').trim();
            if (nextLine) blockComment += ' ' + nextLine;
          }
        }
        if (blockComment) commentBlocks.push(blockComment);
      }
    }
    
    return commentBlocks.length > 0 
      ? commentBlocks.join(' ').substring(0, 200) + (commentBlocks.join(' ').length > 200 ? '...' : '')
      : 'Custom JavaScript logic implementation';
  };

  // Generate explanation for the code
  const generateCodeExplanation = (jsCode: string): string => {
    const functions = extractFunctions(jsCode);
    const hasReturn = jsCode.includes('return');
    const hasItems = jsCode.includes('$input.all()') || jsCode.includes('items');
    const hasAsync = jsCode.includes('async') || jsCode.includes('await');
    const hasJson = jsCode.includes('JSON.');
    const hasConsole = jsCode.includes('console.');
    const hasError = jsCode.includes('try') && jsCode.includes('catch');
    
    let explanation = "This JavaScript code node performs the following operations:\n\n";
    
    if (hasItems) {
      explanation += "• Processes input data from the previous workflow step\n";
    }
    
    if (functions.length > 0) {
      explanation += `• Defines ${functions.length > 1 ? 'functions' : 'a function'}: ${functions.join(', ')}\n`;
    }
    
    if (hasAsync) {
      explanation += "• Handles asynchronous operations (API calls, database queries, etc.)\n";
    }
    
    if (hasJson) {
      explanation += "• Performs JSON parsing or stringification operations\n";
    }
    
    if (hasError) {
      explanation += "• Includes error handling with try-catch blocks\n";
    }
    
    if (hasConsole) {
      explanation += "• Includes debugging output via console logging\n";
    }
    
    if (hasReturn) {
      explanation += "• Returns processed data to be used by subsequent workflow steps\n";
    }
    
    explanation += "\nThis code integrates seamlessly with n8n's data flow system.";
    
    return explanation;
  };

  // Analyze code complexity
  const analyzeCodeComplexity = (jsCode: string): { level: string; color: string; reasons: string[] } => {
    const lines = jsCode.split('\n').filter(line => line.trim().length > 0).length;
    const functions = extractFunctions(jsCode);
    const hasAsync = jsCode.includes('async') || jsCode.includes('await');
    const hasLoops = /for\s*\(|while\s*\(|forEach|for\s+of|for\s+in/.test(jsCode);
    const hasConditions = /if\s*\(|switch\s*\(|\?\s*:/.test(jsCode);
    const hasRegex = /\/[^/\n]+\/[gimuy]*/.test(jsCode);
    const hasErrorHandling = jsCode.includes('try') && jsCode.includes('catch');
    const hasComplexData = /Object\.|Array\.|Map\.|Set\./.test(jsCode);
    
    let complexity = 0;
    const reasons: string[] = [];
    
    if (lines > 100) { complexity += 3; reasons.push(`${lines} lines of code`); }
    else if (lines > 50) { complexity += 2; reasons.push(`${lines} lines of code`); }
    else if (lines > 20) { complexity += 1; reasons.push(`${lines} lines of code`); }
    
    if (functions.length > 5) { complexity += 3; reasons.push(`${functions.length} functions`); }
    else if (functions.length > 2) { complexity += 2; reasons.push(`${functions.length} functions`); }
    else if (functions.length > 0) { complexity += 1; reasons.push(`${functions.length} function${functions.length > 1 ? 's' : ''}`); }
    
    if (hasAsync) { complexity += 1; reasons.push('Async operations'); }
    if (hasLoops) { complexity += 1; reasons.push('Loops and iterations'); }
    if (hasConditions) { complexity += 1; reasons.push('Conditional logic'); }
    if (hasRegex) { complexity += 1; reasons.push('Regular expressions'); }
    if (hasErrorHandling) { complexity += 1; reasons.push('Error handling'); }
    if (hasComplexData) { complexity += 1; reasons.push('Complex data operations'); }
    
    if (complexity <= 3) return { level: 'Simple', color: 'green', reasons };
    if (complexity <= 7) return { level: 'Moderate', color: 'yellow', reasons };
    return { level: 'Complex', color: 'red', reasons };
  };

  const CodeBlock = ({ 
    code, 
    index, 
    title, 
    language = "javascript" 
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
    const functions = extractFunctions(step.jsCode);
    const explanation = generateCodeExplanation(step.jsCode);
    const logicDescription = extractLogicDescription(step.jsCode);
    const complexity = analyzeCodeComplexity(step.jsCode);
    
    // Generate a Node.js/standalone version of the code
    const generateStandaloneVersion = (jsCode: string): string => {
      let standaloneCode = `// Standalone Node.js version
// You can run this independently or integrate it into your own applications

`;

      // Add input data handling
      if (jsCode.includes('$input.all()')) {
        standaloneCode += `// Replace $input.all() with your actual data source
const inputData = []; // Your input data here

`;
      }

      // Replace n8n-specific syntax
      let processedCode = jsCode
        .replace(/\$input\.all\(\)/g, 'inputData')
        .replace(/\$input\.first\(\)/g, 'inputData[0]')
        .replace(/\$node\[.*?\]/g, 'previousNodeData')
        .replace(/\$json/g, 'item');

      standaloneCode += processedCode;

      // Add export statement
      if (functions.length > 0) {
        standaloneCode += `\n\n// Export for use in other modules
module.exports = { ${functions.join(', ')} };`;
      }

      return standaloneCode;
    };

    // Generate package.json for the standalone version
    const generatePackageJson = (): string => {
      const dependencies: string[] = [];
      
      // Check for common dependencies
      if (step.jsCode.includes('axios') || step.jsCode.includes('fetch')) {
        dependencies.push('"axios": "^1.6.0"');
      }
      if (step.jsCode.includes('lodash') || step.jsCode.includes('_')) {
        dependencies.push('"lodash": "^4.17.21"');
      }
      if (step.jsCode.includes('moment')) {
        dependencies.push('"moment": "^2.29.4"');
      }
      if (step.jsCode.includes('crypto')) {
        dependencies.push('"crypto-js": "^4.1.1"');
      }

      return `{
  "name": "n8n-extracted-code",
  "version": "1.0.0",
  "description": "Extracted JavaScript code from n8n workflow",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    ${dependencies.join(',\n    ')}
  },
  "engines": {
    "node": ">=14.0.0"
  }
}`;
    };
    
    return (
      <div className="border-t border-primary/10">
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex-1">
                n8n Code
              </TabsTrigger>
              <TabsTrigger value="standalone" className="flex-1">
                Standalone
              </TabsTrigger>
              <TabsTrigger value="package" className="flex-1">
                Package.json
              </TabsTrigger>
              <TabsTrigger value="explanation" className="flex-1">
                How it Works
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="font-mono text-xs bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-3 py-1">
                    <Play className="h-3 w-3 mr-2" />
                    JavaScript
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {functions.length} function{functions.length !== 1 ? 's' : ''}
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
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {step.jsCode.split('\n').filter(line => line.trim().length > 0).length} lines
                  </code>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Code Purpose:
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {step.description !== 'Custom JavaScript logic' 
                      ? step.description 
                      : logicDescription
                    }
                  </p>
                </div>
                
                {functions.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                      <Braces className="h-4 w-4" />
                      Functions Defined:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {functions.map((func, idx) => (
                        <code key={idx} className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-sm text-green-800 dark:text-green-300">
                          {func}()
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {complexity.level !== 'Simple' && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Complexity Analysis:
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                      This code is rated as <strong>{complexity.level}</strong> due to:
                    </p>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 list-disc list-inside">
                      {complexity.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Quick copy buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(step.jsCode, `${stepIndex}-full-code`)}
                    className="justify-start"
                  >
                    {copiedIndex === `${stepIndex}-full-code` ? (
                      <Check className="h-3 w-3 mr-2 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 mr-2" />
                    )}
                    Copy Full Code
                  </Button>
                  {functions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(functions.join(', '), `${stepIndex}-functions`)}
                      className="justify-start"
                    >
                      {copiedIndex === `${stepIndex}-functions` ? (
                        <Check className="h-3 w-3 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-2" />
                      )}
                      Copy Function Names
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              <CodeBlock
                code={step.jsCode}
                index={stepIndex.toString()}
                title="Original n8n JavaScript Code"
                language="javascript"
              />
            </TabsContent>

            <TabsContent value="standalone" className="mt-0">
              <CodeBlock
                code={generateStandaloneVersion(step.jsCode)}
                index={`${stepIndex}-standalone`}
                title="Standalone Node.js Version"
                language="javascript"
              />
            </TabsContent>

            <TabsContent value="package" className="mt-0">
              <CodeBlock
                code={generatePackageJson()}
                index={`${stepIndex}-package`}
                title="Package.json Configuration"
                language="json"
              />
            </TabsContent>

            <TabsContent value="explanation" className="mt-0">
              <div className="space-y-4">
                <div className="bg-card p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Code Breakdown
                  </h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{explanation}</pre>
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Integration Notes
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• This code runs within n8n's JavaScript execution environment</li>
                    <li>• Input data is accessed via <code className="bg-muted px-1 rounded">$input.all()</code></li>
                    <li>• Return value becomes output for next workflow step</li>
                    <li>• All standard JavaScript and Node.js APIs are available</li>
                    <li>• Error handling should be implemented for production use</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                    <BookOpen className="h-4 w-4" />
                    Usage Tips
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Test your code with sample data before deploying</li>
                    <li>• Add console.log() statements for debugging</li>
                    <li>• Handle errors gracefully with try-catch blocks</li>
                    <li>• Document complex logic with comments</li>
                    <li>• Consider performance implications for large datasets</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  };

  if (!codeSteps || codeSteps.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-full">
              <Code className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium">No JavaScript Code Found</h3>
            <p className="text-muted-foreground max-w-md">
              This workflow doesn't contain any JavaScript code nodes to display.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold">
          JavaScript Code Steps
        </h3>
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
          {codeSteps.length} code block{codeSteps.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {codeSteps.map((step, index) => {
        const isExpanded = expandedSteps.has(index);
        const complexity = analyzeCodeComplexity(step.jsCode);
        
        return (
          <Card key={step.id} className="w-full overflow-hidden border-blue-200/50 dark:border-blue-800/50 transition-all duration-200 hover:shadow-md">
            <CardHeader 
              className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors p-4"
              onClick={() => toggleExpanded(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 hover:bg-transparent flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Code className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold mb-1">
                      <span className="truncate" title={step.name}>
                        {step.name} (Code Logic)
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex-shrink-0">
                        JavaScript
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
                    <p className="text-sm text-muted-foreground mt-1 truncate" title={step.description}>
                      {step.description}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-4 flex-shrink-0">
                  Step {step.stepNumber}
                </Badge>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <StepContent step={step} stepIndex={index} />
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default CodingSteps;