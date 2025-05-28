"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Zap,
  ChevronDown,
  ChevronRight,
  Settings,
  MessageSquare,
  Bot,
} from "lucide-react";

// Mock data based on your paste.txt content

const LangChainSteps = ({ workflowJson }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [activeTab, setActiveTab] = useState({});

  // Use mock data for demo, replace with actual workflow processing
  let langchainSteps = workflowJson;

  // Uncomment when your processWorkflowForWebsite function is working
  // try {
  //   const workflowData = processWorkflowForWebsite(workflowJson);
  //   langchainSteps = workflowData.data.langchainSteps;
  // } catch (error) {
  //   console.error('Error processing workflow:', error);
  // }

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
    }
    setExpandedSteps(newExpanded);
  };

  const setActiveTabForStep = (stepIndex, tab) => {
    setActiveTab((prev) => ({
      ...prev,
      [stepIndex]: tab,
    }));
  };

  const getNodeTypeIcon = (type) => {
    if (type.includes("lmChatOpenAi"))
      return <Bot className="text-blue-500" size={20} />;
    if (type.includes("agent"))
      return <Zap className="text-purple-500" size={20} />;
    if (type.includes("openAi"))
      return <MessageSquare className="text-green-500" size={20} />;
    return <Settings className="text-gray-500" size={20} />;
  };

  const getNodeTypeColor = (type) => {
    if (type.includes("lmChatOpenAi")) return "border-blue-200 bg-blue-50";
    if (type.includes("agent")) return "border-purple-200 bg-purple-50";
    if (type.includes("openAi")) return "border-green-200 bg-green-50";
    return "border-gray-200 bg-gray-50";
  };

  const CodeBlock = ({ code, index, title, language = "json" }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Settings size={16} />
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
    const currentTab = activeTab[stepIndex] || "parameters";

    return (
      <div className="border-t border-gray-200">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTabForStep(stepIndex, "parameters")}
            className={`px-4 py-2 text-sm font-medium ${
              currentTab === "parameters"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Parameters
          </button>
          {step.copyableContent?.prompt && (
            <button
              onClick={() => setActiveTabForStep(stepIndex, "prompt")}
              className={`px-4 py-2 text-sm font-medium ${
                currentTab === "prompt"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Prompt Template
            </button>
          )}
          {step.copyableContent?.systemMessage && (
            <button
              onClick={() => setActiveTabForStep(stepIndex, "system")}
              className={`px-4 py-2 text-sm font-medium ${
                currentTab === "system"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              System Message
            </button>
          )}
          {step.copyableContent?.modelConfig && (
            <button
              onClick={() => setActiveTabForStep(stepIndex, "model")}
              className={`px-4 py-2 text-sm font-medium ${
                currentTab === "model"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Model Config
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {currentTab === "parameters" && (
            <CodeBlock
              code={step.parameters}
              index={stepIndex}
              title="Full Parameters"
              language="json"
            />
          )}

          {currentTab === "prompt" && step.copyableContent?.prompt && (
            <CodeBlock
              code={
                typeof step.copyableContent.prompt === "string"
                  ? step.copyableContent.prompt
                  : JSON.stringify(step.copyableContent.prompt, null, 2)
              }
              index={stepIndex}
              title="Prompt Template"
              language="text"
            />
          )}

          {currentTab === "system" && step.copyableContent?.systemMessage && (
            <CodeBlock
              code={step.copyableContent.systemMessage}
              index={stepIndex}
              title="System Message"
              language="text"
            />
          )}

          {currentTab === "model" && step.copyableContent?.modelConfig && (
            <CodeBlock
              code={JSON.stringify(step.copyableContent.modelConfig, null, 2)}
              index={stepIndex}
              title="Model Configuration"
              language="json"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Zap className="text-purple-600" />
          AI Steps
        </h1>
        <p className="text-gray-600">
          AI model configurations and prompts from your n8n LangChain nodes
        </p>
      </div>

      {langchainSteps && langchainSteps.length > 0 ? (
        <div className="space-y-6">
          {langchainSteps.map((step, index) => (
            <div
              key={index}
              className={`border rounded-lg shadow-sm ${getNodeTypeColor(
                step.type
              )}`}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-70 transition-colors"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex items-center gap-3">
                  {expandedSteps.has(index) ? (
                    <ChevronDown size={20} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-500" />
                  )}
                  {getNodeTypeIcon(step.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{step.type}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Step {index + 1}</div>
              </div>

              {expandedSteps.has(index) && (
                <TabContent step={step} stepIndex={index} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Zap size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No LangChain steps found in the workflow</p>
        </div>
      )}
    </div>
  );
};

export default LangChainSteps;
