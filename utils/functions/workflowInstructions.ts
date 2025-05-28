/**
 * Extracts specific node types from n8n workflow JSON
 * Focuses on LangChain nodes and Code nodes for documentation
 */
function extractN8NNodes(workflowJson) {
  const nodes = workflowJson.nodes || [];

  const extracted = {
    langchainNodes: [],
    codeNodes: [],
    httpNodes: [],
    allSteps: [],
  };

  nodes.forEach((node, index) => {
    const step = {
      stepNumber: index + 1,
      type: node.type,
      name: node.name,
      id: node.id,
    };

    // Extract LangChain nodes
    if (node.type === "@n8n/n8n-nodes-langchain.lmChatOpenAi") {
      extracted.langchainNodes.push({
        ...step,
        category: "Chat Model",
        parameters: {
          model: node.parameters?.model,
          options: node.parameters?.options,
        },
        credentials: node.credentials,
      });
    }

    if (node.type === "@n8n/n8n-nodes-langchain.openAi") {
      extracted.langchainNodes.push({
        ...step,
        category: "OpenAI",
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
      extracted.langchainNodes.push({
        ...step,
        category: "Agent",
        parameters: {
          promptType: node.parameters?.promptType,
          text: node.parameters?.text,
          systemMessage: node.parameters?.options?.systemMessage,
        },
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
        // Handle different body types
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
function getBodyType(parameters) {
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
function tryParseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

/**
 * Helper function to extract description from jsCode comments
 */
function extractCodeDescription(jsCode) {
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
function formatForDisplay(extractedData) {
  return {
    langchainSteps: extractedData.langchainNodes.map((node) => ({
      title: `${node.name} (${node.category})`,
      type: node.type,
      parameters: JSON.stringify(node.parameters, null, 2),
      copyableContent: {
        modelConfig: node.parameters?.model || node.parameters?.modelId,
        prompt: node.parameters?.text || node.parameters?.messages,
        systemMessage: node.parameters?.systemMessage,
      },
    })),

    codeSteps: extractedData.codeNodes.map((node) => ({
      title: `${node.name} (Code Logic)`,
      description: node.description,
      jsCode: node.jsCode,
      copyableContent: node.jsCode,
    })),

    httpSteps: extractedData.httpNodes.map((node) => ({
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

    allSteps: extractedData.allSteps.map((step) => ({
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
function getUrlDomain(url) {
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
function getCategoryFromType(nodeType) {
  if (nodeType.includes("langchain")) return "AI/LangChain";
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
function processWorkflowForWebsite(workflowJson) {
  const extracted = extractN8NNodes(workflowJson);
  const formatted = formatForDisplay(extracted);

  return {
    workflowName: workflowJson.name,
    totalSteps: extracted.allSteps.length,
    langchainCount: extracted.langchainNodes.length,
    codeCount: extracted.codeNodes.length,
    httpCount: extracted.httpNodes.length,
    data: formatted,
  };
}

// Example usage:
/*
const workflowData = processWorkflowForWebsite(yourWorkflowJson);

// For LangChain nodes display:
workflowData.data.langchainSteps.forEach(step => {
  console.log(`Title: ${step.title}`);
  console.log(`Parameters: ${step.parameters}`);
  console.log(`Copyable: ${JSON.stringify(step.copyableContent)}`);
});

// For Code nodes display:
workflowData.data.codeSteps.forEach(step => {
  console.log(`Title: ${step.title}`);
  console.log(`Code: ${step.copyableContent}`);
});

// For HTTP nodes display:
workflowData.data.httpSteps.forEach(step => {
  console.log(`Title: ${step.title}`);
  console.log(`URL: ${step.copyableContent.url}`);
  console.log(`Method: ${step.copyableContent.method}`);
  console.log(`JSON Body: ${step.copyableContent.formattedJsonBody}`);
});
*/

// Export the main function
export { processWorkflowForWebsite, extractN8NNodes, formatForDisplay };
