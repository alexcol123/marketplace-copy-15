'use client';
import React, { JSX, useState } from 'react';
import { Copy, Check, Code, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import types from the container component
import { CodingStepsProps, CodeStepType, CodeSteps } from "./CodingStepsContainer";

// Props type for the CodeBlock subcomponent
type CodeBlockProps = {
  code: string;
  index: string | number;
  title: string;
};

// Union type for expanded step keys (can be number or string)
type ExpandedStepKey = number | string;

const CodingSteps = ({ workflowJson }: CodingStepsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | number | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set<ExpandedStepKey>());

  // Use the actual workflow data - now properly typed
  const codeSteps: CodeSteps = workflowJson || [];
  const langchainSteps: CodeSteps = []; // Empty array for now since this component focuses on code steps

  const copyToClipboard = async (text: string, index: string | number): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy code");
    }
  };

  const toggleExpanded = (index: ExpandedStepKey): void => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const CodeBlock = ({ code, index, title }: CodeBlockProps): JSX.Element => (
    <div className="relative border border-primary/10 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium">{title}</span>
          <Badge variant="outline" className="text-xs">
            javascript
          </Badge>
        </div>
        <Button
          onClick={() => copyToClipboard(code, index)}
          variant="outline"
          size="sm"
          className="gap-1.5 h-8"
        >
          {copiedIndex === index ? (
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
      <pre className="bg-muted/10 text-foreground p-4 overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Code Steps Section */}
      {codeSteps && codeSteps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">
              Code Nodes
            </h3>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              {codeSteps.length} {codeSteps.length === 1 ? 'step' : 'steps'}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {codeSteps.map((step: CodeStepType, index: number) => (
              <div key={index} className="border border-blue-200/50 dark:border-blue-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div 
                  className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-950/20 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors rounded-t-lg"
                  onClick={() => toggleExpanded(index)}
                >
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
                    <div>
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    Step {index + 1}
                  </Badge>
                </div>
                
                {expandedSteps.has(index) && (
                  <div className="p-4 border-t border-blue-200/50 dark:border-blue-800/50">
                    <CodeBlock 
                      code={step.copyableContent} 
                      index={index} 
                      title={step.title.split('(')[0].trim()}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LangChain Steps Section - Kept for legacy reasons but empty */}
      {langchainSteps && langchainSteps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">
              LangChain Nodes
            </h3>
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
              {langchainSteps.length} {langchainSteps.length === 1 ? 'step' : 'steps'}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {langchainSteps.map((step: CodeStepType, index: number) => (
              <div key={index} className="border border-purple-200/50 dark:border-purple-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div 
                  className="flex items-center justify-between p-4 bg-purple-50/50 dark:bg-purple-950/20 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors rounded-t-lg"
                  onClick={() => toggleExpanded(`langchain-${index}`)}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 hover:bg-transparent"
                    >
                      {expandedSteps.has(`langchain-${index}`) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <div>
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">AI/LangChain Configuration</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    Step {index + 1}
                  </Badge>
                </div>
                
                {expandedSteps.has(`langchain-${index}`) && (
                  <div className="p-4 border-t border-purple-200/50 dark:border-purple-800/50">
                    <CodeBlock 
                      code={step.jsCode || step.copyableContent} 
                      index={`langchain-${index}`} 
                      title="Parameters"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!codeSteps || codeSteps.length === 0) && (!langchainSteps || langchainSteps.length === 0) && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-full mb-4">
            <Code className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Code Steps Found
          </h3>
          <p className="text-muted-foreground">
            This workflow doesn&apos;t contain any custom code or function nodes.
          </p>
        </div>
      )}
    </div>
  );
};

export default CodingSteps;