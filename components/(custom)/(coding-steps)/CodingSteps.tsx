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
} from "lucide-react";
import { toast } from "sonner";

// Types for the component
export type CodeStepType = {
  title: string;
  description: string;
  jsCode: string;
  copyableContent: string;
  nodeType?: string;
  requirements?: string[];
};

export type CodingStepsProps = {
  workflowJson: CodeStepType[];
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
  step: CodeStepType;
  stepIndex: number;
};

const CodingSteps = ({ workflowJson }: CodingStepsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set<number>());

  const codeSteps = workflowJson;

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
    const functionRegex = /function\s+(\w+)|const\s+(\w+)\s*=|let\s+(\w+)\s*=|var\s+(\w+)\s*=/g;
    const functions: string[] = [];
    let match;
    
    while ((match = functionRegex.exec(jsCode)) !== null) {
      const funcName = match[1] || match[2] || match[3] || match[4];
      if (funcName && !functions.includes(funcName)) {
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
        commentBlocks.push(line.replace('//', '').trim());
      } else if (line.startsWith('/*')) {
        let blockComment = line.replace('/*', '').trim();
        while (i < lines.length && !line.includes('*/')) {
          i++;
          if (i < lines.length) {
            blockComment += ' ' + lines[i].replace('*/', '').replace('*', '').trim();
          }
        }
        commentBlocks.push(blockComment);
      }
    }
    
    return commentBlocks.length > 0 
      ? commentBlocks.join(' ') 
      : 'Custom JavaScript logic implementation';
  };

  // Generate explanation for the code
  const generateCodeExplanation = (jsCode: string): string => {
    const functions = extractFunctions(jsCode);
    const hasReturn = jsCode.includes('return');
    const hasItems = jsCode.includes('$input.all()') || jsCode.includes('items');
    const hasAsync = jsCode.includes('async') || jsCode.includes('await');
    
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
    const hasLoops = /for\s*\(|while\s*\(|forEach/.test(jsCode);
    const hasConditions = /if\s*\(|switch\s*\(/.test(jsCode);
    const hasRegex = /\/.*\/[gimuy]*/.test(jsCode);
    
    let complexity = 0;
    const reasons: string[] = [];
    
    if (lines > 50) { complexity += 2; reasons.push(`${lines} lines of code`); }
    if (functions.length > 3) { complexity += 2; reasons.push(`${functions.length} functions`); }
    if (hasAsync) { complexity += 1; reasons.push('Async operations'); }
    if (hasLoops) { complexity += 1; reasons.push('Loops present'); }
    if (hasConditions) { complexity += 1; reasons.push('Conditional logic'); }
    if (hasRegex) { complexity += 1; reasons.push('Regular expressions'); }
    
    if (complexity <= 2) return { level: 'Simple', color: 'green', reasons };
    if (complexity <= 5) return { level: 'Moderate', color: 'yellow', reasons };
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
      return `// Standalone Node.js version
// You can run this independently or integrate it into your own applications

${jsCode.includes('$input.all()') 
  ? '// Replace $input.all() with your actual data source\nconst inputData = []; // Your input data here\n\n' 
  : ''
}${jsCode.replace(/\$input\.all\(\)/g, 'inputData')}

// Export for use in other modules
module.exports = { ${functions.join(', ')} };`;
    };
    
    return (
      <div className="border-t border-primary/10">
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex-1">
                n8n Code
              </TabsTrigger>
              <TabsTrigger value="standalone" className="flex-1">
                Standalone
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
                  <Badge variant="outline" className="font-mono text-xs bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-3 py-1">
                    <Play className="h-3 w-3 mr-2" />
                    JavaScript
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {functions.length} function{functions.length !== 1 ? 's' : ''}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      complexity.color === 'green' ? 'border-green-500 text-green-600' :
                      complexity.color === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                      'border-red-500 text-red-600'
                    }`}
                  >
                    {complexity.level}
                  </Badge>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {step.jsCode.split('\n').length} lines
                  </code>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Code Purpose:
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {step.description !== 'Custom JavaScript logic' 
                      ? step.description 
                      : logicDescription
                    }
                  </p>
                </div>
                
                {functions.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                      🔧 Functions Defined:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {functions.map((func, idx) => (
                        <code key={idx} className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-sm text-blue-800 dark:text-blue-300">
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

                {step.requirements && step.requirements.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                      📦 Requirements:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {step.requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs text-purple-600 border-purple-300">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Quick copy buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(step.copyableContent, `${stepIndex}-full-code`)}
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
                index={stepIndex.toString()}
                title="Standalone Node.js Version"
                language="javascript"
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
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <Code className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No JavaScript Code Found</h3>
            <p className="text-muted-foreground">
              This workflow doesn't contain any JavaScript code nodes to display.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          JavaScript Code Analysis
        </h2>
        <p className="text-muted-foreground">
          Detailed breakdown of the JavaScript code used in this workflow
        </p>
      </div>

      {codeSteps.map((step, index) => {
        const isExpanded = expandedSteps.has(index);
        
        return (
          <Card key={index} className="w-full overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleExpanded(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {step.nodeType || 'JavaScript'}
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
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