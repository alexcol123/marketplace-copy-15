// components/(custom)/(coding-steps)/CodingStepsContainer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, FileCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import step display components
import AISteps from './AISteps';
import CodingSteps from './CodingSteps';
import HttpSteps from './HttpSteps';

// Import the extraction function
import { processWorkflowForWebsite } from '@/utils/n8n-extractor';

interface CodingStepsContainerProps {
  workflowJson: any; // The JSON from the database
}

// Type definitions for the step components
export type HttpStepType = {
  stepNumber: number;
  type: string;
  name: string;
  id: string;
  nodeId: string;
  matchingId: string;
  category: string;
  parameters: any;
  credentials?: any;
  jsonBody?: string;
  parsedJsonBody?: any;
  bodyParameters?: any;
  bodyType: string;
};

export type AIStepType = {
  stepNumber: number;
  type: string;
  name: string;
  id: string;
  nodeId: string;
  matchingId: string;
  category: string;
  aiProvider: string;
  parameters: any;
  credentials?: any;
};

export type CodeStepType = {
  stepNumber: number;
  type: string;
  name: string;
  id: string;
  nodeId: string;
  matchingId: string;
  category: string;
  jsCode: string;
  description: string;
};

// Props for step components
export interface HttpStepsProps {
  steps: HttpStepType[];
}

export interface AIStepsProps {
  steps: AIStepType[];
}

export interface CodingStepsProps {
  steps: CodeStepType[];
}

export default function CodingStepsContainer({ workflowJson }: CodingStepsContainerProps) {
  const [extractedData, setExtractedData] = useState<any>(null);
  const [currentStepType, setCurrentStepType] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(true);

  // Process the workflow JSON on mount
  useEffect(() => {
    if (!workflowJson) return;

    setIsProcessing(true);
    try {
      // Parse the JSON if it's a string, otherwise use as-is
      const parsedJson = typeof workflowJson === 'string' 
        ? JSON.parse(workflowJson) 
        : workflowJson;
      
      // Extract steps using your existing function
      const processed = processWorkflowForWebsite(parsedJson);
      setExtractedData(processed);
      
      // Auto-select first available step type
      if (processed.extracted.aiNodes.length > 0) {
        setCurrentStepType('ai');
      } else if (processed.extracted.codeNodes.length > 0) {
        setCurrentStepType('coding');
      } else if (processed.extracted.httpNodes.length > 0) {
        setCurrentStepType('http');
      }
    } catch (error) {
      console.error('Error processing workflow:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [workflowJson]);

  if (isProcessing) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing workflow steps...</p>
      </div>
    );
  }

  if (!extractedData) {
    return (
      <div className="text-center py-12">
        <FileCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Workflow Data</h3>
        <p className="text-muted-foreground">
          Unable to extract coding steps from this workflow.
        </p>
      </div>
    );
  }

  const stepTypes = [
    {
      id: 'overview',
      title: 'Overview',
      count: extractedData?.totalSteps || 0,
      available: true
    },
    {
      id: 'ai',
      title: 'AI Integration',
      count: extractedData?.extracted.aiNodes.length || 0,
      available: extractedData?.extracted.aiNodes.length > 0
    },
    {
      id: 'coding',
      title: 'Custom Code',
      count: extractedData?.extracted.codeNodes.length || 0,
      available: extractedData?.extracted.codeNodes.length > 0
    },
    {
      id: 'http',
      title: 'API Requests',
      count: extractedData?.extracted.httpNodes.length || 0,
      available: extractedData?.extracted.httpNodes.length > 0
    }
  ];

  const availableSteps = stepTypes.filter(step => step.available);
  const currentIndex = availableSteps.findIndex(step => step.id === currentStepType);

  const nextStep = () => {
    if (currentIndex < availableSteps.length - 1) {
      setCurrentStepType(availableSteps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) {
      setCurrentStepType(availableSteps[currentIndex - 1].id);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStepType) {
      case 'ai':
        return <AISteps steps={extractedData.extracted.aiNodes} />;
      case 'coding':
        return <CodingSteps steps={extractedData.extracted.codeNodes} />;
      case 'http':
        return <HttpSteps steps={extractedData.extracted.httpNodes} />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Coding Tutorial: "{extractedData.workflowName}"</h2>
              <p className="text-muted-foreground mb-6">
                This workflow has been analyzed and broken down into teachable coding steps. 
                Learn how to implement each part of the automation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  🤖 AI Integration
                </h3>
                <p className="text-2xl font-bold mb-1">{extractedData.extracted.aiNodes.length}</p>
                <p className="text-sm text-muted-foreground">
                  OpenAI, Claude, and other AI service integrations
                </p>
                {extractedData.extracted.aiNodes.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => setCurrentStepType('ai')}
                  >
                    Learn AI Integration
                  </Button>
                )}
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                  💻 Custom Code
                </h3>
                <p className="text-2xl font-bold mb-1">{extractedData.extracted.codeNodes.length}</p>
                <p className="text-sm text-muted-foreground">
                  JavaScript functions and custom logic
                </p>
                {extractedData.extracted.codeNodes.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => setCurrentStepType('coding')}
                  >
                    Learn Custom Code
                  </Button>
                )}
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                  🌐 HTTP APIs
                </h3>
                <p className="text-2xl font-bold mb-1">{extractedData.extracted.httpNodes.length}</p>
                <p className="text-sm text-muted-foreground">
                  API calls and webhook integrations
                </p>
                {extractedData.extracted.httpNodes.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => setCurrentStepType('http')}
                  >
                    Learn API Integration
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Complete Workflow Breakdown</h3>
              <div className="space-y-2">
                {extractedData.extracted.allSteps.map((step: any) => (
                  <div key={step.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <div>
                        <p className="font-medium">{step.name}</p>
                        <p className="text-sm text-muted-foreground">{step.category}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {step.type.split('.').pop()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Coding Tutorial
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn how to build this workflow by examining the actual implementation steps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Tutorial Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stepTypes.map((stepType) => (
                <button
                  key={stepType.id}
                  onClick={() => stepType.available && setCurrentStepType(stepType.id)}
                  disabled={!stepType.available}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    stepType.id === currentStepType
                      ? 'bg-primary text-primary-foreground'
                      : stepType.available
                      ? 'bg-muted/20 hover:bg-muted/40'
                      : 'bg-muted/10 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{stepType.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      stepType.id === currentStepType
                        ? 'bg-primary-foreground/20'
                        : stepType.available
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {stepType.count}
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {stepTypes.find(s => s.id === currentStepType)?.title}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    From workflow: "{extractedData.workflowName}"
                  </p>
                </div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {stepTypes.find(s => s.id === currentStepType)?.count} steps
                </span>
              </div>
            </CardHeader>
            
            <CardContent>
              {renderCurrentStep()}
              
              {/* Navigation */}
              {availableSteps.length > 1 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    onClick={prevStep}
                    disabled={currentIndex === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    {currentIndex + 1} of {availableSteps.length} sections
                  </div>
                  
                  <Button
                    onClick={nextStep}
                    disabled={currentIndex === availableSteps.length - 1}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}