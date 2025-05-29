// components/(custom)/(workflow-steps)/CodeStepCard.tsx
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check, FileCode, Play, BookOpen } from "lucide-react";
import { UnifiedStepData, STEP_THEMES } from "@/types/workflowSteps";
import BaseStepCard from "./BaseStepCard";

interface CodeStepCardProps {
  step: UnifiedStepData;
}

const CodeStepCard: React.FC<CodeStepCardProps> = ({ step }) => {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  // Safe function to get the code from parameters
  const getCode = () => {
    const params = step.parameters || {};
    return params.jsCode || params.code || params.pythonCode || '';
  };

  // Safe function to determine language
  const getLanguage = () => {
    const params = step.parameters || {};
    const nodeType = step.type?.toLowerCase() || '';
    
    if (params.jsCode || nodeType.includes('javascript') || nodeType.includes('code')) {
      return 'javascript';
    } else if (params.pythonCode || nodeType.includes('python')) {
      return 'python';
    } else if (params.code) {
      return 'javascript'; // Default assumption
    } else {
      return 'javascript';
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [key]: true });
      setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
    });
  };

  const getLanguageBadgeColor = (language: string) => {
    switch (language.toLowerCase()) {
      case 'javascript':
        return 'bg-yellow-100 text-yellow-800';
      case 'python':
        return 'bg-blue-100 text-blue-800';
      case 'typescript':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const extractCodeInfo = (code: string) => {
    if (!code) return { functions: [], lines: 0, hasAsync: false, hasLoops: false };
    
    const lines = code.split('\n').length;
    const functionMatches = code.match(/function\s+(\w+)|const\s+(\w+)\s*=|let\s+(\w+)\s*=|var\s+(\w+)\s*=/g) || [];
    const functions = functionMatches.map(match => 
      match.replace(/function\s+|const\s+|let\s+|var\s+|=.*$/g, '').trim()
    ).filter(Boolean);
    const hasAsync = /async|await|Promise|\.then|\.catch/.test(code);
    const hasLoops = /for\s*\(|while\s*\(|forEach|map|filter|reduce/.test(code);
    
    return { functions, lines, hasAsync, hasLoops };
  };

  const code = getCode();
  const language = getLanguage();
  const codeInfo = extractCodeInfo(code);

  const codeContent = (
    <div className="space-y-4">
      {/* Language and Code Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge 
          variant="outline" 
          className={`font-mono ${getLanguageBadgeColor(language)} px-3 py-1`}
        >
          <FileCode className="h-4 w-4 mr-1" />
          {language.toUpperCase()}
        </Badge>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{codeInfo.lines} lines</span>
          {codeInfo.functions.length > 0 && (
            <>
              <span>•</span>
              <span>{codeInfo.functions.length} function{codeInfo.functions.length !== 1 ? 's' : ''}</span>
            </>
          )}
          {codeInfo.hasAsync && (
            <>
              <span>•</span>
              <Badge variant="secondary" className="text-xs">Async</Badge>
            </>
          )}
          {codeInfo.hasLoops && (
            <>
              <span>•</span>
              <Badge variant="secondary" className="text-xs">Loops</Badge>
            </>
          )}
        </div>
      </div>

      {/* What this code step does */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
          <Code className="h-4 w-4" />
          Code Execution
        </h4>
        <p className="text-sm text-green-700">
          This step executes custom {language} code within the n8n workflow. It can process data, 
          make calculations, transform information, and return results to be used by subsequent workflow steps.
        </p>
      </div>

      {/* Functions found in code */}
      {codeInfo.functions.length > 0 && (
        <div>
          <h5 className="font-medium text-sm mb-2">Functions Defined:</h5>
          <div className="flex flex-wrap gap-2">
            {codeInfo.functions.map((func, index) => (
              <Badge key={index} variant="outline" className="font-mono text-xs">
                {func}()
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Display code */}
      {code && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-sm flex items-center gap-2">
              <Play className="h-4 w-4" />
              {language === 'javascript' ? 'JavaScript' : 'Python'} Code:
            </h5>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(code, 'code')}
              className="h-8 px-2"
            >
              {copied.code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded border text-sm font-mono whitespace-pre-wrap max-h-80 overflow-y-auto">
            {code}
          </div>
        </div>
      )}

      {/* Quick copy buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy(code, 'fullCode')}
          className="gap-1"
        >
          {copied.fullCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          Copy Full Code
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const blob = new Blob([code], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${step.name.replace(/\s+/g, '-').toLowerCase()}.js`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="gap-1"
        >
          <FileCode className="h-3 w-3" />
          Download JS File
        </Button>
      </div>

      {/* Code Execution Tips */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
          <BookOpen className="h-4 w-4" />
          n8n Code Node Tips:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Access input data with <code className="bg-blue-100 px-1 rounded">$input.all()</code> or <code className="bg-blue-100 px-1 rounded">$input.first()</code></li>
          <li>• Return data using <code className="bg-blue-100 px-1 rounded">return [{`{json: {...}}`}]</code></li>
          <li>• Use <code className="bg-blue-100 px-1 rounded">console.log()</code> for debugging (check n8n logs)</li>
          <li>• Access workflow data with <code className="bg-blue-100 px-1 rounded">$workflow</code> and <code className="bg-blue-100 px-1 rounded">$node</code></li>
          <li>• Handle errors with try/catch blocks for better reliability</li>
        </ul>
      </div>

      {/* Node.js Environment Note */}
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h4 className="font-semibold mb-2 text-amber-800">
          Environment:
        </h4>
        <p className="text-sm text-amber-700">
          This code runs in a Node.js environment within n8n. Most standard JavaScript and Node.js 
          features are available, but browser-specific APIs are not accessible.
        </p>
      </div>
    </div>
  );

  return (
    <BaseStepCard
      step={step}
      theme={STEP_THEMES.code}
      icon={Code}
      title="Code Execution Step"
      description="This step executes custom code to process data, perform calculations, or transform information within the workflow."
    >
      {codeContent}
    </BaseStepCard>
  );
};

export default CodeStepCard;