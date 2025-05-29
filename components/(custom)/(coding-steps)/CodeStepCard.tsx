// Enhanced CodeStepCard - Replace your simple version with this
// components/(custom)/(workflow-steps)/CodeStepCard.tsx

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Code, 
  FileCode, 
  Zap, 
  Terminal, 
  Eye, 
  EyeOff,
  Copy,
  Check,
  PlayCircle,
  Settings
} from "lucide-react";

interface CodeStepCardProps {
  step: {
    id: string;
    name: string;
    type: string;
    category: string;
    parameters: any;
    stepNumber: number;
  };
}

const CodeStepCard: React.FC<CodeStepCardProps> = ({ step }) => {
  const [showFullCode, setShowFullCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract code from parameters
  const jsCode = step.parameters?.jsCode || step.parameters?.code || "";
  const pythonCode = step.parameters?.pythonCode || "";
  const codeLanguage = step.parameters?.mode || "javascript";

  // Determine the actual code to display
  const displayCode = jsCode || pythonCode || "// No code available";
  const language = pythonCode ? "python" : codeLanguage;

  // Get code preview (first few lines)
  const getCodePreview = (code: string, maxLines: number = 4) => {
    const lines = code.split('\n').filter(line => line.trim() !== '');
    if (lines.length <= maxLines) return code;
    return lines.slice(0, maxLines).join('\n') + '\n// ... (' + (lines.length - maxLines) + ' more lines)';
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Analyze what the code does
  const getCodePurpose = () => {
    const lowerName = step.name.toLowerCase();
    const lowerCode = displayCode.toLowerCase();

    if (lowerName.includes("voice") || lowerName.includes("audio")) {
      return {
        purpose: "Audio Processing Logic",
        description: "Processes audio data, selects appropriate voice settings based on gender, and prepares voice parameters for the workflow."
      };
    } else if (lowerName.includes("image") || lowerName.includes("photo")) {
      return {
        purpose: "Image Data Processing",
        description: "Handles image processing, extracts image metadata, and prepares visual assets for further processing steps."
      };
    } else if (lowerName.includes("video")) {
      return {
        purpose: "Video Coordination Logic",
        description: "Coordinates video generation by combining image and audio assets, managing video creation parameters and workflow."
      };
    } else if (lowerCode.includes("merge") || lowerCode.includes("items.find")) {
      return {
        purpose: "Data Transformation",
        description: "Searches through workflow data items, merges different data sources, and transforms information for subsequent steps."
      };
    } else {
      return {
        purpose: "Custom Business Logic",
        description: "Executes custom JavaScript code to process workflow data and implement specific business requirements."
      };
    }
  };

  // Extract key operations from code
  const getCodeOperations = () => {
    const operations = [];
    const lowerCode = displayCode.toLowerCase();

    if (lowerCode.includes("json.parse") || lowerCode.includes("json.stringify")) {
      operations.push("JSON Processing");
    }
    if (lowerCode.includes("items.find") || lowerCode.includes("filter")) {
      operations.push("Data Filtering");
    }
    if (lowerCode.includes("return")) {
      operations.push("Data Return");
    }
    if (lowerCode.includes("console.log")) {
      operations.push("Debug Logging");
    }
    if (lowerCode.includes("binary")) {
      operations.push("Binary Data");
    }
    if (lowerCode.includes("gender") || lowerCode.includes("male") || lowerCode.includes("female")) {
      operations.push("Gender Logic");
    }
    if (lowerCode.includes("id") && lowerCode.includes("asset")) {
      operations.push("Asset Management");
    }
    if (operations.length === 0) {
      operations.push("Custom Logic");
    }

    return operations.slice(0, 4);
  };

  const codePurpose = getCodePurpose();
  const codeOperations = getCodeOperations();
  const codeLines = displayCode.split('\n').length;
  const codeChars = displayCode.length;

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 dark:border-orange-800 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg shadow-sm">
              <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-sm">
                  {step.stepNumber}
                </span>
                {step.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <PlayCircle className="h-3 w-3" />
                {codePurpose.purpose}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              <Terminal className="h-3 w-3 mr-1" />
              {language}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {codeLines} lines
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Purpose Description */}
        <div className="bg-white/50 dark:bg-gray-900/20 rounded-lg p-4 border border-orange-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-sm">What this code does:</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {codePurpose.description}
          </p>
        </div>

        {/* Key Operations */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-sm">Key Operations:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {codeOperations.map((operation, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200 transition-colors"
              >
                {operation}
              </Badge>
            ))}
          </div>
        </div>

        {/* Code Preview/Full Code */}
        {displayCode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-sm">Code:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-7 px-2 text-xs border-orange-200 hover:bg-orange-50"
                >
                  {copied ? (
                    <Check className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullCode(!showFullCode)}
                  className="h-7 px-2 text-xs border-orange-200 hover:bg-orange-50"
                >
                  {showFullCode ? (
                    <EyeOff className="h-3 w-3 mr-1" />
                  ) : (
                    <Eye className="h-3 w-3 mr-1" />
                  )}
                  {showFullCode ? "Hide" : "Show All"}
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-orange-200 shadow-sm">
              <div className="bg-gray-800 px-3 py-2 flex items-center justify-between border-b border-gray-700">
                <span className="text-xs text-gray-400 font-mono flex items-center gap-2">
                  <Terminal className="h-3 w-3" />
                  {language === "python" ? "Python" : "JavaScript"}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{codeLines} lines</span>
                  <span>•</span>
                  <span>{codeChars} chars</span>
                </div>
              </div>
              
              <ScrollArea className={showFullCode ? "max-h-64" : "h-32"}>
                <pre className="p-4 text-sm text-gray-100 font-mono overflow-x-auto leading-relaxed">
                  <code>{showFullCode ? displayCode : getCodePreview(displayCode, 6)}</code>
                </pre>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Technical Stats */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-orange-200/50">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {codeLines}
            </div>
            <div className="text-xs text-muted-foreground">Lines</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {Object.keys(step.parameters || {}).length}
            </div>
            <div className="text-xs text-muted-foreground">Parameters</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {language === "javascript" ? "JS" : language.toUpperCase()}
            </div>
            <div className="text-xs text-muted-foreground">Language</div>
          </div>
        </div>

        {/* Usage Note */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Terminal className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>
              This code executes during workflow runtime and can access workflow data through the <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">$input</code> and <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">items</code> variables.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeStepCard;