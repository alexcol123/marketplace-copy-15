// utils/n8n-extractor.ts

/**
 * Unified step data structure for all node types
 */
export interface UnifiedStepData {
  // Basic info
  id: string;
  stepNumber: number;
  type: 'ai' | 'http' | 'code' | 'other';
  name: string;
  category: string;
  
  // Standalone workflow for this step
  standaloneWorkflow: any;
  
  // Ready-to-copy content
  copyableContent: {
    workflowJson: string;
    parameters: string;
    curlCommand?: string;
    jsCode?: string;
  };
  
  // Simple extracted data for display
  aiData?: {
    provider: string;
    model: string;
    prompt: string;
    systemMessage: string;
  };
  
  httpData?: {
    method: string;
    url: string;
    body: string;
    headers: string;
  };
  
  codeData?: {
    code: string;
    language: string;
  };
}

/**
 * Extract simple string value from n8n objects
 */
function extractValue(obj: any): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object' && obj.value) return String(obj.value);
  return String(obj);
}

/**
 * Generate standalone workflow for a single step
 */
function createStandaloneWorkflow(node: any): any {
  return {
    nodes: [node],
    connections: {},
    pinData: {},
    meta: {
      templateCredsSetupCompleted: true
    }
  };
}

/**
 * Generate cURL command for HTTP requests
 */
function generateCurl(parameters: any): string {
  const method = parameters?.method || 'GET';
  const url = extractValue(parameters?.url) || 'YOUR_URL_HERE';
  
  let curl = `curl -X ${method} "${url}"`;
  
  if (parameters?.sendBody && parameters?.jsonBody) {
    curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${parameters.jsonBody}'`;
  }
  
  return curl;
}

/**
 * Process AI node
 */
function processAINode(node: any, stepNumber: number): UnifiedStepData {
  const standaloneWorkflow = createStandaloneWorkflow(node);
  
  // Determine AI provider and model
  let provider = 'AI';
  let category = 'AI Model';
  
  if (node.type.includes('openai') || node.type.includes('OpenAi')) {
    provider = 'OpenAI';
    category = node.type.includes('Chat') ? 'Chat AI Model' : 'AI Text Generation';
  } else if (node.type.includes('anthropic')) {
    provider = 'Anthropic';
    category = 'AI Assistant';
  } else if (node.type.includes('google') || node.type.includes('gemini')) {
    provider = 'Google';
    category = 'AI Model';
  }
  
  const model = extractValue(node.parameters?.model || node.parameters?.modelId);
  const prompt = extractValue(node.parameters?.text || node.parameters?.messages);
  const systemMessage = extractValue(node.parameters?.systemMessage);
  
  return {
    id: node.id,
    stepNumber,
    type: 'ai',
    name: node.name,
    category,
    standaloneWorkflow,
    copyableContent: {
      workflowJson: JSON.stringify(standaloneWorkflow, null, 2),
      parameters: JSON.stringify(node.parameters, null, 2),
    },
    aiData: {
      provider,
      model,
      prompt,
      systemMessage,
    }
  };
}

/**
 * Process HTTP node
 */
function processHttpNode(node: any, stepNumber: number): UnifiedStepData {
  const standaloneWorkflow = createStandaloneWorkflow(node);
  
  const method = node.parameters?.method || 'GET';
  const url = extractValue(node.parameters?.url);
  const body = node.parameters?.jsonBody || '';
  const headers = node.parameters?.options?.headers ? 
    JSON.stringify(node.parameters.options.headers, null, 2) : '';
  
  return {
    id: node.id,
    stepNumber,
    type: 'http',
    name: node.name,
    category: 'HTTP Request',
    standaloneWorkflow,
    copyableContent: {
      workflowJson: JSON.stringify(standaloneWorkflow, null, 2),
      parameters: JSON.stringify(node.parameters, null, 2),
      curlCommand: generateCurl(node.parameters),
    },
    httpData: {
      method,
      url,
      body,
      headers,
    }
  };
}

/**
 * Process Code node
 */
function processCodeNode(node: any, stepNumber: number): UnifiedStepData {
  const standaloneWorkflow = createStandaloneWorkflow(node);
  const code = node.parameters?.jsCode || '';
  
  return {
    id: node.id,
    stepNumber,
    type: 'code',
    name: node.name,
    category: 'JavaScript Code',
    standaloneWorkflow,
    copyableContent: {
      workflowJson: JSON.stringify(standaloneWorkflow, null, 2),
      parameters: JSON.stringify(node.parameters, null, 2),
      jsCode: code,
    },
    codeData: {
      code,
      language: 'javascript',
    }
  };
}

/**
 * Process generic node
 */
function processGenericNode(node: any, stepNumber: number): UnifiedStepData {
  const standaloneWorkflow = createStandaloneWorkflow(node);
  
  return {
    id: node.id,
    stepNumber,
    type: 'other',
    name: node.name,
    category: getCategoryFromType(node.type),
    standaloneWorkflow,
    copyableContent: {
      workflowJson: JSON.stringify(standaloneWorkflow, null, 2),
      parameters: JSON.stringify(node.parameters, null, 2),
    }
  };
}

/**
 * Main extraction function - simplified
 */
function extractN8NNodes(workflowJson: any): UnifiedStepData[] {
  const nodes = workflowJson.nodes || [];
  const steps: UnifiedStepData[] = [];
  
  nodes.forEach((node: any, index: number) => {
    const stepNumber = index + 1;
    
    // AI Nodes
    if (isAINode(node.type)) {
      steps.push(processAINode(node, stepNumber));
    }
    // HTTP Nodes
    else if (node.type === "n8n-nodes-base.httpRequest") {
      steps.push(processHttpNode(node, stepNumber));
    }
    // Code Nodes
    else if (node.type === "n8n-nodes-base.code") {
      steps.push(processCodeNode(node, stepNumber));
    }
    // Everything else
    else {
      steps.push(processGenericNode(node, stepNumber));
    }
  });
  
  return steps;
}

/**
 * Check if node is AI-related
 */
function isAINode(nodeType: string): boolean {
  const aiTypes = [
    '@n8n/n8n-nodes-langchain.lmChatOpenAi',
    '@n8n/n8n-nodes-langchain.openAi',
    '@n8n/n8n-nodes-langchain.agent',
    'n8n-nodes-base.openAi',
    'n8n-nodes-base.anthropic',
    'n8n-nodes-base.googleAi',
  ];
  
  return aiTypes.some(type => nodeType.includes(type));
}

/**
 * Helper to categorize node types
 */
function getCategoryFromType(nodeType: string): string {
  if (nodeType.includes('httpRequest')) return 'API Call';
  if (nodeType.includes('code')) return 'Custom Code';
  if (nodeType.includes('googleDrive')) return 'File Storage';
  if (nodeType.includes('gmail')) return 'Email';
  if (nodeType.includes('webhook')) return 'Webhook';
  if (nodeType.includes('wait')) return 'Wait';
  if (nodeType.includes('if')) return 'Conditional';
  return 'Other';
}

/**
 * Main function to process workflow
 */
export function processWorkflowForWebsite(workflowJson: any) {
  const steps = extractN8NNodes(workflowJson);
  
  return {
    workflowName: workflowJson.name || "Untitled Workflow",
    totalSteps: steps.length,
    steps: steps,
    // Legacy support
    extracted: {
      aiNodes: steps.filter(s => s.type === 'ai'),
      httpNodes: steps.filter(s => s.type === 'http'),
      codeNodes: steps.filter(s => s.type === 'code'),
      allSteps: steps,
    }
  };
}

// Export individual functions
export { extractN8NNodes };