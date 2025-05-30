// utils/functions/WorkflowStepsInOrder.ts (note the capital letters to match your import)

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  parameters?: Record<string, unknown>;
  position: [number, number];
  [key: string]: unknown;
}

export interface WorkflowConnections {
  [nodeName: string]: {
    [outputIndex: string]: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  };
}

export interface WorkflowJson {
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  name?: string;
  active?: boolean;
  settings?: Record<string, unknown>;
  tags?: string[];
  [key: string]: unknown;
}

export interface OrderedWorkflowStep extends WorkflowNode {
  originalName: string;
  stepNumber: number;
  isStartingNode: boolean;
  isTrigger: boolean;
  isDisconnected: boolean;
}

/**
 * Analyzes a workflow JSON and returns the nodes in their execution order
 * @param workflowJson - The n8n workflow JSON object
 * @returns Array of nodes in execution order with additional metadata
 */
export function getWorkflowStepsInOrder(workflowJson: WorkflowJson | any): OrderedWorkflowStep[] {
  // Validate input
  if (!workflowJson || !workflowJson.nodes || !workflowJson.connections) {
    console.warn("Invalid workflow JSON provided or missing nodes/connections.");
    return [];
  }

  const nodes = workflowJson.nodes;
  const connections = workflowJson.connections;

  // Create maps for efficient lookups
  const nodesMap = new Map<string, WorkflowNode>();
  nodes.forEach((node: WorkflowNode) => {
    nodesMap.set(node.id, { ...node, originalName: node.name });
  });

  const nameToIdMap = new Map<string, string>();
  nodes.forEach((node: WorkflowNode) => {
    nameToIdMap.set(node.name, node.id);
  });

  const orderedSteps: OrderedWorkflowStep[] = [];
  const visitedNodeIds = new Set<string>();
  const processingQueue: string[] = [];

  // Find all target nodes (nodes that are destinations of connections)
  const allTargetNodeIds = new Set<string>();
  Object.values(connections).forEach((sourceOutputPorts: any) => {
    Object.values(sourceOutputPorts).forEach((portConnections: any) => {
      portConnections.forEach((connectionTargets: any) => {
        connectionTargets.forEach((targetInfo: any) => {
          const targetId = nameToIdMap.get(targetInfo.node);
          if (targetId) {
            allTargetNodeIds.add(targetId);
          } else {
            console.warn(`Could not find ID for target node name: ${targetInfo.node}`);
          }
        });
      });
    });
  });

  // Find starting nodes (triggers or nodes that aren't targets of other nodes)
  nodes.forEach((node: WorkflowNode) => {
    const isTriggerType = node.type.includes('Trigger');
    const isNotTarget = !allTargetNodeIds.has(node.id);
    const sourceNodeNameInConnections = Object.keys(connections).find(name => nameToIdMap.get(name) === node.id);

    if (isTriggerType || (isNotTarget && sourceNodeNameInConnections)) {
      if (!processingQueue.includes(node.id) && !visitedNodeIds.has(node.id)) {
        processingQueue.push(node.id);
      }
    }
  });

  // Fallback: if no starting nodes found, use the top-left node
  if (processingQueue.length === 0 && nodes.length > 0) {
    let topLeftNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].position[0] < topLeftNode.position[0] ||
          (nodes[i].position[0] === topLeftNode.position[0] && nodes[i].position[1] < topLeftNode.position[1])) {
        topLeftNode = nodes[i];
      }
    }
    if (topLeftNode && !processingQueue.includes(topLeftNode.id) && !visitedNodeIds.has(topLeftNode.id)) {
      processingQueue.push(topLeftNode.id);
    }
  }

  // Process nodes in order
  let iterationGuard = 0;
  const MAX_ITERATIONS = nodes.length * 3;

  while (processingQueue.length > 0 && iterationGuard < MAX_ITERATIONS) {
    iterationGuard++;
    const currentNodeId = processingQueue.shift();

    if (!currentNodeId || visitedNodeIds.has(currentNodeId)) {
      continue;
    }

    const currentNodeData = nodesMap.get(currentNodeId);
    if (!currentNodeData) {
      console.warn(`Node data not found for ID: ${currentNodeId}`);
      continue;
    }

    // Create ordered step with metadata
    const orderedStep: OrderedWorkflowStep = {
      ...currentNodeData,
      originalName: currentNodeData.name,
      stepNumber: orderedSteps.length + 1,
      isStartingNode: !allTargetNodeIds.has(currentNodeId),
      isTrigger: currentNodeData.type.includes('Trigger'),
      isDisconnected: false
    };

    orderedSteps.push(orderedStep);
    visitedNodeIds.add(currentNodeId);

    // Find and queue connected nodes
    const sourceConnections = connections[currentNodeData.name];
    if (sourceConnections) {
      Object.values(sourceConnections).forEach((portConnectionsArray: any) => {
        portConnectionsArray.forEach((targetNodesArray: any) => {
          targetNodesArray.forEach((targetInfo: any) => {
            const nextNodeId = nameToIdMap.get(targetInfo.node);
            if (nextNodeId && nodesMap.has(nextNodeId) && !visitedNodeIds.has(nextNodeId)) {
              if (!processingQueue.includes(nextNodeId)) {
                processingQueue.push(nextNodeId);
              }
            } else if (!nextNodeId) {
              console.warn(`Could not find ID for target node name in connection: ${targetInfo.node}`);
            }
          });
        });
      });
    }
  }

  if (iterationGuard >= MAX_ITERATIONS) {
    console.warn("Max iterations reached in getWorkflowStepsInOrder. Potential cycle or very complex graph.");
  }

  // Add any disconnected nodes
  nodes.forEach((node: WorkflowNode) => {
    if (!visitedNodeIds.has(node.id)) {
      if (nodesMap.has(node.id)) {
        const disconnectedStep: OrderedWorkflowStep = {
          ...nodesMap.get(node.id)!,
          originalName: node.name,
          stepNumber: orderedSteps.length + 1,
          isStartingNode: false,
          isTrigger: node.type.includes('Trigger'),
          isDisconnected: true
        };
        orderedSteps.push(disconnectedStep);
        console.warn(`Node added as potentially disconnected: ${node.name} (ID: ${node.id})`);
      } else {
        console.warn(`Node ${node.name} (ID: ${node.id}) was in nodes list but not in nodesMap during disconnected check.`);
      }
    }
  });

  return orderedSteps;
}

/**
 * Gets workflow execution statistics
 * @param workflowJson - The n8n workflow JSON object
 * @returns Object with workflow statistics
 */
export function getWorkflowStats(workflowJson: WorkflowJson | any) {
  const orderedSteps = getWorkflowStepsInOrder(workflowJson);
  
  return {
    totalSteps: orderedSteps.length,
    triggerSteps: orderedSteps.filter(step => step.isTrigger).length,
    actionSteps: orderedSteps.filter(step => !step.isTrigger).length,
    disconnectedSteps: orderedSteps.filter(step => step.isDisconnected).length,
    startingSteps: orderedSteps.filter(step => step.isStartingNode).length,
    nodeTypes: [...new Set(orderedSteps.map(step => step.type))],
    complexity: orderedSteps.length <= 3 ? 'Simple' : orderedSteps.length <= 8 ? 'Moderate' : 'Complex'
  };
}

/**
 * Gets a simplified array of step names in execution order
 * @param workflowJson - The n8n workflow JSON object
 * @returns Array of step names in execution order
 */
export function getWorkflowStepNames(workflowJson: WorkflowJson | any): string[] {
  const orderedSteps = getWorkflowStepsInOrder(workflowJson);
  return orderedSteps.map(step => step.name);
}

/**
 * Gets only the trigger nodes from a workflow
 * @param workflowJson - The n8n workflow JSON object
 * @returns Array of trigger nodes
 */
export function getWorkflowTriggers(workflowJson: WorkflowJson | any): OrderedWorkflowStep[] {
  const orderedSteps = getWorkflowStepsInOrder(workflowJson);
  return orderedSteps.filter(step => step.isTrigger);
}

// Export as default
export default getWorkflowStepsInOrder;