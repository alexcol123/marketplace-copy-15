// utils/n8n-extractor.ts

/**
 * Extracts specific node types from n8n workflow JSON
 * Focuses on AI nodes and Code nodes for documentation
 */
function extractN8NNodes(workflowJson: any) {
  const nodes = workflowJson.nodes || [];

  const extracted = {
    aiNodes: [],
    codeNodes: [],
    httpNodes: [],
    allSteps: [],
  };

  nodes.forEach((node: any, index: number) => {
    const step = {
      stepNumber: index + 1,
      type: node.type,
      name: node.name,
      id: node.id,
    };

    // Extract AI nodes (previously LangChain nodes)
    if (node.type === "@n8n/n8n-nodes-langchain.lmChatOpenAi") {
      extracted.aiNodes.push({
        ...step,
        category: "Chat AI Model",
        aiProvider: "OpenAI",
        parameters: {
          model: node.parameters?.model,
          options: node.parameters?.options,
        },
        credentials: node.credentials,
      });
    }

    if (node.type === "@n8n/n8n-nodes-langchain.openAi") {
      extracted.aiNodes.push({
        ...step,
        category: "AI Text Generation",
        aiProvider: "OpenAI",
        parameters: {
          modelId: node.parameters?.modelId,
          messages: node.parameters?.messages,
          jsonOutput: node.parameters?.jsonOutput,
          options: node.parameters?.options,
        },
        credentials: node.credentials,
      });
    }

    if (node.type === "@n8n/n8n-nodes-langchain.agent") {
      extracted.aiNodes.push({
        ...step,
        category: "AI Agent",
        aiProvider: "OpenAI",
        parameters: {
          promptType: node.parameters?.promptType,
          text: node.parameters?.text,
          systemMessage: node.parameters?.options?.systemMessage,
        },
      });
    }

    // Add more AI providers as they become available
    if (node.type.includes("anthropic") || node.type.includes("claude")) {
      extracted.aiNodes.push({
        ...step,
        category: "AI Assistant",
        aiProvider: "Anthropic",
        parameters: node.parameters,
      });
    }

    if (node.type.includes("gemini") || node.type.includes("google")) {
      extracted.aiNodes.push({
        ...step,
        category: "AI Model",
        aiProvider: "Google",
        parameters: node.parameters,
      });
    }

    // Extract Code nodes
    if (node.type === "n8n-nodes-base.code") {
      extracted.codeNodes.push({
        ...step,
        category: "Code Node",
        jsCode: node.parameters?.jsCode,
        description: extractCodeDescription(node.parameters?.jsCode),
      });
    }

    // Extract ALL HTTP Request nodes
    if (node.type === "n8n-nodes-base.httpRequest") {
      extracted.httpNodes.push({
        ...step,
        category: "HTTP Request",
        parameters: {
          method: node.parameters?.method,
          url: node.parameters?.url,
          authentication: node.parameters?.authentication,
          genericAuthType: node.parameters?.genericAuthType,
          sendBody: node.parameters?.sendBody,
          specifyBody: node.parameters?.specifyBody,
          jsonBody: node.parameters?.jsonBody,
          contentType: node.parameters?.contentType,
          bodyParameters: node.parameters?.bodyParameters,
          options: node.parameters?.options,
        },
        credentials: node.credentials,
        jsonBody: node.parameters?.jsonBody,
        parsedJsonBody: node.parameters?.jsonBody
          ? tryParseJson(node.parameters.jsonBody)
          : null,
        bodyParameters: node.parameters?.bodyParameters,
        bodyType: getBodyType(node.parameters),
      });
    }

    // Add to all steps for general workflow display
    extracted.allSteps.push(step);
  });

  return extracted;
}

/**
 * Helper function to determine body type of HTTP request
 */
function getBodyType(parameters: any) {
  if (!parameters?.sendBody) return "none";
  if (parameters.specifyBody === "json" && parameters.jsonBody) return "json";
  if (parameters.bodyParameters && parameters.bodyParameters.parameters)
    return "form";
  if (parameters.contentType === "multipart-form-data") return "multipart";
  if (parameters.contentType === "application/x-www-form-urlencoded")
    return "urlencoded";
  return "other";
}

/**
 * Helper function to safely parse JSON strings
 */
function tryParseJson(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

/**
 * Helper function to extract description from jsCode comments
 */
function extractCodeDescription(jsCode: string) {
  if (!jsCode) return "No description available";

  const lines = jsCode.split("\n");
  const commentLines = lines
    .filter((line) => line.trim().startsWith("//"))
    .map((line) => line.replace("//", "").trim());

  return commentLines.length > 0
    ? commentLines.join(" ")
    : "Custom JavaScript logic";
}

/**
 * Formats extracted data for display on website
 */
function formatForDisplay(extractedData: any) {
  return {
    aiSteps: extractedData.aiNodes.map((node: any) => ({
      title: `${node.name} (${node.category})`,
      type: node.type,
      aiProvider: node.aiProvider,
      category: node.category,
      parameters: JSON.stringify(node.parameters, null, 2),
      rawParameters: node.parameters, // Add raw parameters for easier access
      copyableContent: {
        modelConfig: node.parameters?.model || node.parameters?.modelId,
        prompt: node.parameters?.text || node.parameters?.messages,
        systemMessage: node.parameters?.systemMessage,
      },
    })),

    codeSteps: extractedData.codeNodes.map((node: any) => ({
      title: `${node.name} (Code Logic)`,
      description: node.description,
      jsCode: node.jsCode,
      copyableContent: node.jsCode,
    })),

    httpSteps: extractedData.httpNodes.map((node: any) => ({
      title: `${node.name} (HTTP Request)`,
      description: `${
        node.parameters?.method || "GET"
      } request to ${getUrlDomain(node.parameters?.url)}`,
      method: node.parameters?.method,
      url: node.parameters?.url,
      bodyType: node.bodyType,
      jsonBody: node.jsonBody,
      parsedJsonBody: node.parsedJsonBody,
      bodyParameters: node.bodyParameters,
      parameters: JSON.stringify(node.parameters, null, 2),
      rawParameters: node.parameters, // Add raw parameters for easier access
      copyableContent: {
        url: node.parameters?.url,
        method: node.parameters?.method,
        jsonBody: node.jsonBody,
        formattedJsonBody: node.parsedJsonBody
          ? JSON.stringify(node.parsedJsonBody, null, 2)
          : node.jsonBody,
        bodyParameters: node.bodyParameters
          ? JSON.stringify(node.bodyParameters, null, 2)
          : null,
        fullParameters: JSON.stringify(node.parameters, null, 2),
      },
    })),

    allSteps: extractedData.allSteps.map((step: any) => ({
      step: step.stepNumber,
      name: step.name,
      type: step.type,
      category: getCategoryFromType(step.type),
    })),
  };
}

/**
 * Helper to extract domain from URL for display
 */
function getUrlDomain(url: string) {
  if (!url) return "Unknown";
  try {
    return new URL(url).hostname;
  } catch {
    return url.split("/")[2] || url;
  }
}

/**
 * Helper to categorize node types
 */
function getCategoryFromType(nodeType: string) {
  if (nodeType.includes("langchain")) return "AI Integration";
  if (nodeType.includes("openai")) return "AI Integration";
  if (nodeType.includes("anthropic")) return "AI Integration";
  if (nodeType.includes("gemini")) return "AI Integration";
  if (nodeType.includes("code")) return "Custom Code";
  if (nodeType.includes("httpRequest")) return "API Call";
  if (nodeType.includes("googleDrive")) return "File Storage";
  if (nodeType.includes("gmail")) return "Email";
  if (nodeType.includes("formTrigger")) return "Input Form";
  if (nodeType.includes("wait")) return "Timing";
  if (nodeType.includes("if")) return "Logic";
  if (nodeType.includes("merge")) return "Data Processing";
  return "Other";
}

/**
 * Main function to process workflow and return website-ready data
 */
export function processWorkflowForWebsite(workflowJson: any) {
  const extracted = extractN8NNodes(workflowJson);
  const formatted = formatForDisplay(extracted);

  return {
    workflowName: workflowJson.name || "Untitled Workflow",
    totalSteps: extracted.allSteps.length,
    aiCount: extracted.aiNodes.length,
    codeCount: extracted.codeNodes.length,
    httpCount: extracted.httpNodes.length,
    data: formatted,
  };
}

// Export individual functions for flexibility
export { extractN8NNodes, formatForDisplay };