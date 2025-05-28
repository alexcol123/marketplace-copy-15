"use client";
import React, { useState } from "react";
import {
  Copy,
  Check,
  Globe,
  ChevronDown,
  ChevronRight,
  Link,
  Code2,
} from "lucide-react";

const HttpSteps = ({ workflowJson }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [activeTab, setActiveTab] = useState({});

  let httpSteps = workflowJson;

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
      // Set default tab when expanding
      if (!activeTab[index]) {
        setActiveTabForStep(index, "url");
      }
    }
    setExpandedSteps(newExpanded);
  };

  const setActiveTabForStep = (stepIndex, tab) => {
    setActiveTab((prev) => ({
      ...prev,
      [stepIndex]: tab,
    }));
  };

  const getMethodColor = (method) => {
    switch (method?.toUpperCase()) {
      case "POST":
        return "bg-green-100 text-green-800";
      case "GET":
        return "bg-blue-100 text-blue-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "PATCH":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBodyTypeLabel = (bodyType) => {
    switch (bodyType) {
      case "json":
        return { label: "JSON", color: "bg-blue-100 text-blue-800" };
      case "form":
        return { label: "Form Data", color: "bg-green-100 text-green-800" };
      case "multipart":
        return { label: "Multipart", color: "bg-purple-100 text-purple-800" };
      case "urlencoded":
        return { label: "URL Encoded", color: "bg-yellow-100 text-yellow-800" };
      case "none":
        return { label: "No Body", color: "bg-gray-100 text-gray-800" };
      default:
        return { label: "Other", color: "bg-gray-100 text-gray-800" };
    }
  };

  const extractDomain = (url) => {
    if (!url) return "Unknown";
    try {
      const cleanUrl = url.startsWith("=") ? url.substring(1) : url;
      const firstPart = cleanUrl.split("{{")[0];
      if (
        !firstPart ||
        (!firstPart.startsWith("http:") && !firstPart.startsWith("https:"))
      ) {
        const domainMatch = cleanUrl.match(/https?:\/\/([^\/{{}}]+)/);
        if (domainMatch && domainMatch[1]) return domainMatch[1];
        throw new Error(
          "Cannot determine domain from partial URL or expression"
        );
      }
      const urlObj = new URL(firstPart);
      return urlObj.hostname;
    } catch {
      const parts = url.replace(/^=?(https?:\/\/)?/, "").split("/");
      return parts[0] || url;
    }
  };

  const generateCurlCommand = (step) => {
    if (!step.url) return 'curl "URL_NOT_SPECIFIED"';

    const method = step.method || "GET";
    let curl = `curl -X ${method}`;

    // Clean URL - remove leading = and handle n8n expressions
    let cleanUrl = step.copyableContent?.url || step.url;
    if (cleanUrl.startsWith("=")) {
      cleanUrl = cleanUrl.substring(1);
    }
    curl += ` "${cleanUrl}"`;

    // Add authentication placeholder if authentication is detected
    if (
      step.parameters &&
      JSON.stringify(step.parameters).includes("authentication")
    ) {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY_HERE"`;
    }

    // Handle body data based on method and body type
    const shouldHaveBody = ["POST", "PUT", "PATCH"].includes(
      method.toUpperCase()
    );

    if (shouldHaveBody) {
      // Add appropriate content-type headers
      if (step.bodyType === "json" && step.jsonBody) {
        curl += ` \\\n  -H "Content-Type: application/json"`;

        // Clean JSON body - remove leading =
        let cleanJsonBody =
          step.copyableContent?.formattedJsonBody || step.jsonBody;
        if (cleanJsonBody.startsWith("=")) {
          cleanJsonBody = cleanJsonBody.substring(1);
        }
        curl += ` \\\n  -d '${cleanJsonBody}'`;
      } else if (step.bodyType === "form" && step.bodyParameters) {
        curl += ` \\\n  -H "Content-Type: application/x-www-form-urlencoded"`;

        try {
          const params = step.bodyParameters.parameters || [];
          const formData = params
            .map((param) => {
              // Clean parameter values - remove leading = if present
              let value = param.value;
              if (typeof value === "string" && value.startsWith("=")) {
                value = value.substring(1);
              }
              return `${param.name}=${encodeURIComponent(value)}`;
            })
            .join("&");
          curl += ` \\\n  -d "${formData}"`;
        } catch (e) {
          curl += ` \\\n  -d "FORM_DATA_HERE"`;
        }
      } else if (step.bodyType === "multipart") {
        curl += ` \\\n  -H "Content-Type: multipart/form-data"`;
        curl += ` \\\n  -d "MULTIPART_DATA_HERE"`;
      }
    } else if (
      method.toUpperCase() === "GET" &&
      (step.jsonBody || step.bodyParameters)
    ) {
      // For GET requests with body data, add a warning comment
      curl += `\n\n# WARNING: This appears to be a GET request with body data.\n# GET requests typically don't have request bodies.\n# Consider using query parameters instead:\n# ${cleanUrl}?param1=value1&param2=value2`;
    }

    return curl;
  };

  const CodeBlock = ({ code, index, title, language = "json" }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Code2 size={16} />
          <span className="font-mono text-sm">{title}</span>
        </div>
        <button
          onClick={() => copyToClipboard(code, `${index}-${title}`)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
        >
          {copiedIndex === `${index}-${title}` ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  const TabContent = ({ step, stepIndex }) => {
    const currentTab = activeTab[stepIndex] || "url";

    return (
      <div className="border-t border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTabForStep(stepIndex, "url")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              currentTab === "url"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            URL & Method
          </button>
          {step.bodyType === "json" && step.jsonBody && (
            <button
              onClick={() => setActiveTabForStep(stepIndex, "json")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                currentTab === "json"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              JSON Body
            </button>
          )}
          {step.bodyType === "form" && step.bodyParameters && (
            <button
              onClick={() => setActiveTabForStep(stepIndex, "form")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                currentTab === "form"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Form Parameters
            </button>
          )}
          <button
            onClick={() => setActiveTabForStep(stepIndex, "curl")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              currentTab === "curl"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            cURL Command
          </button>
          {step.parameters && (
            <button
              onClick={() => setActiveTabForStep(stepIndex, "parameters")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                currentTab === "parameters"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Parameters
            </button>
          )}
        </div>

        <div className="p-4">
          {currentTab === "url" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTTP Method & URL
                </label>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${getMethodColor(
                      step.method
                    )}`}
                  >
                    {step.method || "GET"}
                  </span>
                  {step.bodyType && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        getBodyTypeLabel(step.bodyType).color
                      }`}
                    >
                      {getBodyTypeLabel(step.bodyType).label}
                    </span>
                  )}
                  <span className="text-sm text-gray-600">
                    to {extractDomain(step.url)}
                  </span>
                </div>
                <CodeBlock
                  code={
                    step.copyableContent?.url || step.url || "No URL specified"
                  }
                  index={`${stepIndex}-url`}
                  title="Endpoint URL"
                  language="text"
                />
              </div>
            </div>
          )}

          {currentTab === "json" &&
            step.bodyType === "json" &&
            step.jsonBody && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Body (JSON)
                </label>
                <CodeBlock
                  code={
                    step.copyableContent?.formattedJsonBody ||
                    step.jsonBody ||
                    "No JSON body"
                  }
                  index={`${stepIndex}-json`}
                  title="JSON Request Body"
                  language="json"
                />
              </div>
            )}

          {currentTab === "form" &&
            step.bodyType === "form" &&
            step.bodyParameters && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Parameters
                </label>
                <CodeBlock
                  code={
                    step.copyableContent?.bodyParameters ||
                    JSON.stringify(step.bodyParameters, null, 2) ||
                    "No form parameters"
                  }
                  index={`${stepIndex}-form`}
                  title="Form Data Parameters"
                  language="json"
                />
              </div>
            )}

          {currentTab === "curl" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                cURL Command
              </label>
              <div className="mb-3 text-sm text-gray-600 space-y-2">
                <p>
                  Copy this command to test the API endpoint directly in your
                  terminal:
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs">
                  <p className="font-semibold text-amber-800 mb-2">
                    ⚠️ Important Notes:
                  </p>
                  <ul className="list-disc ml-4 space-y-1 text-amber-700">
                    <li>
                      Replace all n8n variables like{" "}
                      <code className="bg-amber-100 px-1 rounded">{`{{ $json.voiceId }}`}</code>{" "}
                      with actual values
                    </li>
                    <li>
                      Replace{" "}
                      <code className="bg-amber-100 px-1 rounded">
                        YOUR_API_KEY_HERE
                      </code>{" "}
                      with your actual API key
                    </li>
                    <li>
                      The leading{" "}
                      <code className="bg-amber-100 px-1 rounded">=</code> signs
                      have been removed (n8n-specific syntax)
                    </li>
                    {step.method?.toUpperCase() === "GET" &&
                      (step.jsonBody || step.bodyParameters) && (
                        <li className="text-red-600 font-medium">
                          This GET request has body data - this is unusual.
                          Consider using query parameters instead.
                        </li>
                      )}
                  </ul>
                </div>
              </div>
              <CodeBlock
                code={generateCurlCommand(step)}
                index={`${stepIndex}-curl`}
                title="cURL Command"
                language="bash"
              />
            </div>
          )}

          {currentTab === "parameters" && step.parameters && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Node Configuration
              </label>
              <CodeBlock
                code={step.parameters || "No parameters available"}
                index={`${stepIndex}-params`}
                title="Complete Parameters"
                language="json"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Globe className="text-orange-600" />
          HTTP API Steps
        </h1>
        <p className="text-gray-600">
          HTTP requests from your n8n workflow nodes
        </p>
      </div>

      {httpSteps && httpSteps.length > 0 ? (
        <div className="space-y-6">
          {httpSteps.map((step, index) => (
            <div
              key={index}
              className="border border-orange-200 bg-orange-50 rounded-lg shadow-sm"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  {expandedSteps.has(index) ? (
                    <ChevronDown
                      size={20}
                      className="text-gray-500 flex-shrink-0"
                    />
                  ) : (
                    <ChevronRight
                      size={20}
                      className="text-gray-500 flex-shrink-0"
                    />
                  )}
                  <Link className="text-orange-600 flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3
                        className="font-semibold text-gray-900 truncate"
                        title={step.title}
                      >
                        {step.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getMethodColor(
                          step.method
                        )} flex-shrink-0`}
                      >
                        {step.method || "GET"}
                      </span>
                      {step.bodyType && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            getBodyTypeLabel(step.bodyType).color
                          } flex-shrink-0`}
                        >
                          {getBodyTypeLabel(step.bodyType).label}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm text-gray-600 truncate"
                      title={step.description}
                    >
                      {step.description}
                    </p>
                    <p
                      className="text-xs text-gray-500 mt-1 truncate"
                      title={
                        step.url
                          ? `→ ${extractDomain(step.url)}`
                          : "No URL specified"
                      }
                    >
                      {step.url
                        ? `→ ${extractDomain(step.url)}`
                        : "No URL specified"}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-500 ml-4 flex-shrink-0">
                  Step {index + 1}
                </div>
              </div>

              {expandedSteps.has(index) && (
                <TabContent step={step} stepIndex={index} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Globe size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No HTTP requests found in the workflow</p>
        </div>
      )}
    </div>
  );
};

export default HttpSteps;
