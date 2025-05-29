// components/(custom)/(workflow-steps)/BaseStepCard.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, FileCode, Download } from "lucide-react";
import { UnifiedStepData } from "@/types/workflowSteps";

interface BaseStepCardProps {
  step: UnifiedStepData;
  theme: {
    primary: string;
    background: string;
    border: string;
    text: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}

const BaseStepCard: React.FC<BaseStepCardProps> = ({
  step,
  theme,
  icon: IconComponent,
  title,
  description,
  children,
}) => {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [key]: true });
      setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
    });
  };

  // Generate standalone workflow JSON for this step
  const generateStandaloneWorkflow = () => {
    const standaloneWorkflow = {
      name: `${step.name} - Standalone`,
      nodes: [
        {
          ...step.originalNode,
          position: [0, 0] // Reset position for standalone use
        }
      ],
      connections: {},
      active: false,
      settings: {},
      tags: [`extracted-step`, step.category]
    };
    
    return JSON.stringify(standaloneWorkflow, null, 2);
  };

  // Generate just the node configuration
  const generateNodeConfig = () => {
    return JSON.stringify(step.parameters || {}, null, 2);
  };

  const standaloneWorkflow = generateStandaloneWorkflow();
  const nodeConfig = generateNodeConfig();

  return (
    <Card 
      className="overflow-hidden shadow-lg border-2"
      style={{ borderColor: theme.border }}
    >
      <CardHeader 
        className="pb-4"
        style={{ backgroundColor: theme.background }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <IconComponent 
                className="h-5 w-5" 
                style={{ color: theme.primary }}
              />
            </div>
            <div>
              <CardTitle className="text-lg" style={{ color: theme.text }}>
                {step.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {title}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline"
            style={{ 
              borderColor: theme.border,
              color: theme.primary 
            }}
          >
            Step {step.stepNumber}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 m-0 rounded-none bg-muted/30">
            <TabsTrigger value="overview" className="rounded-none">
              Overview
            </TabsTrigger>
            <TabsTrigger value="workflow" className="rounded-none">
              Copy Workflow
            </TabsTrigger>
            <TabsTrigger value="config" className="rounded-none">
              Configuration
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6 mt-0">
            <div className="space-y-4">
              <p className="text-muted-foreground">{description}</p>
              {children}
            </div>
          </TabsContent>

          {/* Copy Workflow Tab */}
          <TabsContent value="workflow" className="p-6 mt-0">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  Standalone Workflow
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  This JSON contains just this step as a complete workflow that you can import into n8n.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(standaloneWorkflow, 'standalone')}
                    className="gap-1"
                  >
                    {copied.standalone ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    Copy Workflow JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([standaloneWorkflow], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${step.name.replace(/\s+/g, '-').toLowerCase()}-workflow.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download JSON
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {standaloneWorkflow}
                </pre>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>How to use:</strong> Copy the JSON above and import it into n8n as a new workflow. 
                  You may need to configure credentials and adjust parameters for your specific use case.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="p-6 mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Node Parameters
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(nodeConfig, 'config')}
                  className="gap-1"
                >
                  {copied.config ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy Config
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg border p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {nodeConfig}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Node Type:</strong>
                  <p className="text-muted-foreground font-mono">{step.type}</p>
                </div>
                <div>
                  <strong>Category:</strong>
                  <p className="text-muted-foreground capitalize">{step.category}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BaseStepCard;