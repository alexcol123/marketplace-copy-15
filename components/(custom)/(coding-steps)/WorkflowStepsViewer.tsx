// components/(custom)/(workflow-steps)/WorkflowStepsViewer.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  List,
  Workflow,
  Info,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Hash,
} from "lucide-react";
import { UnifiedStepData } from "@/types/workflowSteps";
import AIStepCard from "./AIStepCard";
import HttpStepCard from "./HttpStepCard";
import CodeStepCard from "./CodeStepCard";
import GenericStepCard from "./GenericStepCard";

interface WorkflowStepsViewerProps {
  workflowContent: string | any;
  title?: string;
  showTitle?: boolean;
  maxStepsToShow?: number;
  className?: string;
}

const WorkflowStepsViewer: React.FC<WorkflowStepsViewerProps> = ({
  workflowContent,
  title = "Workflow Steps",
  showTitle = true,
  maxStepsToShow = 10,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStepExpansion = (stepId: string) => {
  setExpandedSteps((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(stepId)) {
      newSet.delete(stepId);
    } else {
      newSet.add(stepId);
    }
    return newSet;
  });
};

  // Function to determine execution order based on workflow connections
  const getExecutionOrder = (nodes: any[], connections: any) => {
    const executionOrder: string[] = [];
    const visited = new Set<string>();
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    // Build adjacency list from connections
    const adjacencyList = new Map<string, string[]>();
    const incomingEdges = new Map<string, number>();

    // Initialize all nodes
    nodes.forEach((node) => {
      adjacencyList.set(node.id, []);
      incomingEdges.set(node.id, 0);
    });

    // Process connections to build graph
    if (connections && connections.main) {
      Object.entries(connections.main).forEach(
        ([sourceId, outputs]: [string, any]) => {
          if (outputs) {
            Object.values(outputs).forEach((outputArray: any) => {
              if (Array.isArray(outputArray)) {
                outputArray.forEach((connection: any) => {
                  const targetId = connection.node;
                  if (targetId) {
                    adjacencyList.get(sourceId)?.push(targetId);
                    incomingEdges.set(
                      targetId,
                      (incomingEdges.get(targetId) || 0) + 1
                    );
                  }
                });
              }
            });
          }
        }
      );
    }

    // Find trigger nodes (nodes with no incoming connections or trigger types)
    const triggerNodes = nodes.filter((node) => {
      const hasNoIncoming = (incomingEdges.get(node.id) || 0) === 0;
      const isTriggerType =
        node.type?.toLowerCase().includes("trigger") ||
        node.type?.toLowerCase().includes("webhook") ||
        node.type?.toLowerCase().includes("form");
      return hasNoIncoming || isTriggerType;
    });

    // Topological sort starting from trigger nodes
    const queue = [...triggerNodes.map((node) => node.id)];
    const inDegree = new Map(incomingEdges);

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (!visited.has(currentId)) {
        executionOrder.push(currentId);
        visited.add(currentId);

        // Add connected nodes to queue
        const connectedNodes = adjacencyList.get(currentId) || [];
        connectedNodes.forEach((nodeId) => {
          const newInDegree = (inDegree.get(nodeId) || 1) - 1;
          inDegree.set(nodeId, newInDegree);

          if (newInDegree <= 0 && !visited.has(nodeId)) {
            queue.push(nodeId);
          }
        });
      }
    }

    // Add any remaining nodes that weren't connected
    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        executionOrder.push(node.id);
      }
    });

    return executionOrder;
  };

const { steps, workflowInfo, hasError } = useMemo(() => {
  try {
    let workflowData;

    if (typeof workflowContent === "string") {
      workflowData = JSON.parse(workflowContent);
    } else {
      workflowData = workflowContent;
    }

    if (!workflowData?.nodes || !Array.isArray(workflowData.nodes)) {
      throw new Error("Invalid workflow structure: missing nodes array");
    }

    console.log("=== DEBUGGING WORKFLOW PROCESSING ===");
    console.log("Total nodes:", workflowData.nodes.length);

    // First, let's see all nodes before filtering
    console.log("All nodes before filtering:");
    workflowData.nodes.forEach((node, index) => {
      console.log(`${index + 1}. Name: "${node.name}", Type: "${node.type}"`);
    });

    // Filter out sticky notes
    const filteredNodes = workflowData.nodes.filter((node: any) => {
      const nodeType = node.type?.toLowerCase() || "";
      const isSticky = nodeType.includes("stickynote") || 
                      nodeType.includes("sticky-note") || 
                      node.type === "n8n-nodes-base.stickyNote";
      
      if (isSticky) {
        console.log(`❌ Filtered out sticky note: ${node.name}`);
      }
      return !isSticky;
    });

    console.log(`Nodes after filtering: ${filteredNodes.length}`);

    // Process each node and log categorization
    const processedSteps: UnifiedStepData[] = filteredNodes.map((node: any, index: number) => {
      let category: UnifiedStepData["category"] = "generic";
      const nodeType = node.type?.toLowerCase() || "";

      console.log(`\n--- Processing Node ${index + 1} ---`);
      console.log(`Name: "${node.name}"`);
      console.log(`Type: "${node.type}"`);
      console.log(`Type (lowercase): "${nodeType}"`);

      // Check each category condition explicitly
      const isAI = nodeType.includes("openai") || 
                  nodeType.includes("anthropic") || 
                  nodeType.includes("google") || 
                  nodeType.includes("ai") || 
                  nodeType.includes("gpt") || 
                  nodeType.includes("claude");

      const isHTTP = nodeType.includes("http") || 
                    nodeType.includes("webhook") || 
                    nodeType.includes("request");

      const isCode = nodeType.includes("code") || 
                    nodeType.includes("javascript") || 
                    nodeType.includes("python") || 
                    nodeType.includes("function");

      console.log(`AI check: ${isAI}`);
      console.log(`HTTP check: ${isHTTP}`);
      console.log(`Code check: ${isCode}`);

      if (isAI) {
        category = "ai";
        console.log(`✅ Categorized as AI`);
      } else if (isHTTP) {
        category = "http";
        console.log(`✅ Categorized as HTTP`);
      } else if (isCode) {
        category = "code";
        console.log(`✅ Categorized as CODE`);
      } else {
        console.log(`➡️ Categorized as GENERIC`);
      }

      const step = {
        id: node.id || `step-${index}`,
        name: node.name || `Step ${index + 1}`,
        type: node.type || "unknown",
        category,
        parameters: node.parameters || {},
        position: node.position || [0, 0],
        originalNode: node,
        stepNumber: index + 1,
      };

      console.log(`Final step category: ${step.category}`);
      return step;
    });

    // Log final categorization summary
    console.log("\n=== CATEGORIZATION SUMMARY ===");
    const categoryCounts = processedSteps.reduce((acc, step) => {
      acc[step.category] = (acc[step.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`${category.toUpperCase()}: ${count} steps`);
    });

    console.log("\nCode steps specifically:");
    processedSteps
      .filter(step => step.category === "code")
      .forEach(step => {
        console.log(`- ${step.name} (${step.type})`);
      });

    return {
      steps: processedSteps,
      workflowInfo: {
        name: workflowData.name || "Unnamed Workflow",
        nodeCount: workflowData.nodes.length,
        connectionCount: workflowData.connections ? Object.keys(workflowData.connections).length : 0,
        tags: workflowData.tags || [],
        description: workflowData.description || "",
      },
      hasError: false,
    };
  } catch (error) {
    console.error("Error processing workflow:", error);
    return {
      steps: [],
      workflowInfo: null,
      hasError: true,
    };
  }
}, [workflowContent, maxStepsToShow]);

// 2. Enhanced renderStepCard with more debugging
// const renderStepCard = (step: UnifiedStepData) => {
//   const isExpanded = expandedSteps.has(step.id);

//   console.log(`Rendering step: ${step.name}, Category: ${step.category}, Expanded: ${isExpanded}`);

//   if (!isExpanded) {
//     return (
//       <div
//         key={step.id}
//         className="border rounded-lg p-4 hover:border-primary/40 transition-colors cursor-pointer bg-gradient-to-r from-muted/30 to-transparent"
//         onClick={() => {
//           console.log(`Expanding step: ${step.name} (${step.category})`);
//           toggleStepExpansion(step.id);
//         }}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
//               {step.stepNumber}
//             </div>
//             <div>
//               <h4 className="font-medium text-sm">{step.name}</h4>
//               <p className="text-xs text-muted-foreground capitalize">
//                 {step.category} • {step.type.replace(/^n8n-nodes-base\./, "")}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <Badge variant="outline" className="text-xs">
//               {step.category}
//             </Badge>
//             <ChevronRight className="h-4 w-4 text-muted-foreground" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Expanded state - show the full step card
//   console.log(`Rendering expanded card for ${step.name} with category ${step.category}`);

//   return (
//     <div key={step.id} className="space-y-2">
//       <div
//         className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
//         onClick={() => toggleStepExpansion(step.id)}
//       >
//         <ChevronDown className="h-4 w-4" />
//         <span>Collapse Step {step.stepNumber}</span>
//       </div>

//       {/* Debug the specific rendering logic */}
//       {step.category === "ai" && (
//         <>
//           {console.log("Rendering AIStepCard for:", step.name)}
//           <AIStepCard step={step} />
//         </>
//       )}
//       {step.category === "http" && (
//         <>
//           {console.log("Rendering HttpStepCard for:", step.name)}
//           <HttpStepCard step={step} />
//         </>
//       )}
//       {step.category === "code" && (
//         <>
//           {console.log("Rendering CodeStepCard for:", step.name)}
//           {/* Temporary fallback to see if the issue is with CodeStepCard */}
//           <div className="p-4 bg-orange-100 border border-orange-300 rounded">
//             <h3 className="font-bold">CODE STEP: {step.name}</h3>
//             <p>Type: {step.type}</p>
//             <p>Category: {step.category}</p>
//             <pre className="text-xs mt-2 bg-gray-800 text-white p-2 rounded">
//               {JSON.stringify(step.parameters, null, 2)}
//             </pre>
//           </div>
//           {/* Uncomment this when you have CodeStepCard ready */}
//           {/* <CodeStepCard step={step} /> */}
//         </>
//       )}
//       {step.category === "generic" && (
//         <>
//           {console.log("Rendering GenericStepCard for:", step.name)}
//           <GenericStepCard step={step} />
//         </>
//       )}
//     </div>
//   );
// };


// Clean version of renderStepCard function (remove debug code)
const renderStepCard = (step: UnifiedStepData) => {
  const isExpanded = expandedSteps.has(step.id);

  if (!isExpanded) {
    // Collapsed state - show just a summary
    return (
      <div
        key={step.id}
        className="border rounded-lg p-4 hover:border-primary/40 transition-colors cursor-pointer bg-gradient-to-r from-muted/30 to-transparent"
        onClick={() => toggleStepExpansion(step.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {step.stepNumber}
            </div>
            <div>
              <h4 className="font-medium text-sm">{step.name}</h4>
              <p className="text-xs text-muted-foreground capitalize">
                {step.category} • {step.type.replace(/^n8n-nodes-base\./, "")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {step.category}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  // Expanded state - show the full step card
  return (
    <div key={step.id} className="space-y-2">
      {/* Collapse button */}
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={() => toggleStepExpansion(step.id)}
      >
        <ChevronDown className="h-4 w-4" />
        <span>Collapse Step {step.stepNumber}</span>
      </div>

      {/* Render the appropriate card */}
      {step.category === "ai" && <AIStepCard step={step} />}
      {step.category === "http" && <HttpStepCard step={step} />}
      {step.category === "code" && <CodeStepCard step={step} />}
      {step.category === "generic" && <GenericStepCard step={step} />}
    </div>
  );
};

  // Error state
  if (hasError) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-medium">Unable to Parse Workflow</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The workflow data appears to be invalid or corrupted. Please
                check the JSON format.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No steps found
  if (steps.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <Info className="h-5 w-5" />
            <div>
              <h3 className="font-medium">No Workflow Steps Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This workflow doesn't contain any nodes to display as steps.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Card */}
      {showTitle && (
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Workflow className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  {workflowInfo && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {workflowInfo.name} • {steps.length} step
                      {steps.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
                className="gap-2"
              >
                {isVisible ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Steps
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    View Steps
                  </>
                )}
              </Button>
            </div>

            {/* Workflow stats */}
            {workflowInfo && isVisible && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <Badge variant="outline" className="gap-1">
                  <Hash className="h-3 w-3" />
                  {workflowInfo.nodeCount} nodes
                </Badge>
                {workflowInfo.connectionCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <List className="h-3 w-3" />
                    {workflowInfo.connectionCount} connections
                  </Badge>
                )}
                {workflowInfo.tags.length > 0 &&
                  workflowInfo.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Steps Content */}
      {isVisible && (
        <div className="space-y-4">
          {/* Steps List */}
          <div className="space-y-3">{steps.map(renderStepCard)}</div>

          {/* Show truncation notice if applicable */}
          {maxStepsToShow &&
            workflowInfo &&
            workflowInfo.nodeCount > maxStepsToShow && (
              <Card className="border-dashed border-muted-foreground/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>
                      Showing first {maxStepsToShow} of {workflowInfo.nodeCount}{" "}
                      steps. Import the full workflow to see all steps.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Success message */}
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Found {steps.length} workflow step
                  {steps.length !== 1 ? "s" : ""} ready for implementation
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowStepsViewer;
