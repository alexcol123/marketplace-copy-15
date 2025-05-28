'use client';
import React, { useState } from 'react';
import { Copy, Check, Code, Zap, ChevronDown, ChevronRight } from 'lucide-react';

// Mock data based on your paste.txt content
const mockCodeSteps = [
  {
    "title": "Code: Pick voice (Code Logic)",
    "description": "Set appropriate voice ID Return everything plus the selected voice ID",
    "jsCode": "const gender =   $('Form:CartoonVideo').first().json.Gender\n  \n\n\n// Set appropriate voice ID\nlet voiceId;\nif (gender === 'Male') {\n  voiceId = 'goT3UYdM9bhm0n2lmKQx'; // Replace with your actual male voice ID\n} else {\n  voiceId = 'ZF6FPAbjXT4488VcRRnw'; // Replace with your actual female voice ID\n}\n\n// Return everything plus the selected voice ID\nreturn {\n  ...JSON.parse(JSON.stringify($input.item.json)),\n  voiceId: voiceId\n};",
    "copyableContent": "const gender =   $('Form:CartoonVideo').first().json.Gender\n  \n\n\n// Set appropriate voice ID\nlet voiceId;\nif (gender === 'Male') {\n  voiceId = 'goT3UYdM9bhm0n2lmKQx'; // Replace with your actual male voice ID\n} else {\n  voiceId = 'ZF6FPAbjXT4488VcRRnw'; // Replace with your actual female voice ID\n}\n\n// Return everything plus the selected voice ID\nreturn {\n  ...JSON.parse(JSON.stringify($input.item.json)),\n  voiceId: voiceId\n};"
  },
  {
    "title": "Code:image (Code Logic)",
    "description": "Custom JavaScript logic",
    "jsCode": "const binaryItem = items.find(i => i.binary && Object.keys(i.binary).length > 0);\nconst metadataItem = items.find(i => i.json && i.json.id && i.json.type);\n\nconsole.log(items)\n\nreturn [\n  {\n    json: {\n      id: metadataItem.json.id,\n      type: metadataItem.json.type,\n      name: metadataItem.json.name || 'uploaded-asset'\n    },\n    binary: {\n      data: binaryItem.binary.data\n    }\n  }\n];",
    "copyableContent": "const binaryItem = items.find(i => i.binary && Object.keys(i.binary).length > 0);\nconst metadataItem = items.find(i => i.json && i.json.id && i.json.type);\n\nconsole.log(items)\n\nreturn [\n  {\n    json: {\n      id: metadataItem.json.id,\n      type: metadataItem.json.type,\n      name: metadataItem.json.name || 'uploaded-asset'\n    },\n    binary: {\n      data: binaryItem.binary.data\n    }\n  }\n];"
  }
];

const CodingSteps = ({ workflowJson }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  // Use mock data for demo, replace with actual workflow processing
  let codeSteps = mockCodeSteps;
  let langchainSteps = [];
  
  // Uncomment when your processWorkflowForWebsite function is working
  // try {
  //   const workflowData = processWorkflowForWebsite(workflowJson);
  //   codeSteps = workflowData.data.codeSteps;
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
      console.error('Failed to copy: ', err);
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

  const CodeBlock = ({ code, index, title }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Code size={16} />
          <span className="font-mono text-sm">{title}</span>
        </div>
        <button
          onClick={() => copyToClipboard(code, index)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
        >
          {copiedIndex === index ? (
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
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Zap className="text-blue-600" />
          Coding Steps
        </h1>
        <p className="text-gray-600">
          JavaScript code snippets from your n8n workflow nodes
        </p>
      </div>

      {/* Code Steps Section */}
      {codeSteps && codeSteps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Code className="text-green-600" />
            Code Nodes ({codeSteps.length})
          </h2>
          
          <div className="space-y-6">
            {codeSteps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg shadow-sm">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleExpanded(index)}
                >
                  <div className="flex items-center gap-3">
                    {expandedSteps.has(index) ? (
                      <ChevronDown size={20} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Step {index + 1}
                  </div>
                </div>
                
                {expandedSteps.has(index) && (
                  <div className="p-4 border-t border-gray-200">
                    <CodeBlock 
                      code={step.copyableContent} 
                      index={index} 
                      title={step.title.split('(')[0].trim()}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LangChain Steps Section */}
      {langchainSteps && langchainSteps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="text-purple-600" />
            LangChain Nodes ({langchainSteps.length})
          </h2>
          
          <div className="space-y-6">
            {langchainSteps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg shadow-sm">
                <div 
                  className="flex items-center justify-between p-4 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={() => toggleExpanded(`langchain-${index}`)}
                >
                  <div className="flex items-center gap-3">
                    {expandedSteps.has(`langchain-${index}`) ? (
                      <ChevronDown size={20} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">AI/LangChain Configuration</p>
                    </div>
                  </div>
                </div>
                
                {expandedSteps.has(`langchain-${index}`) && (
                  <div className="p-4 border-t border-gray-200">
                    <CodeBlock 
                      code={step.parameters} 
                      index={`langchain-${index}`} 
                      title="Parameters"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!codeSteps || codeSteps.length === 0) && (!langchainSteps || langchainSteps.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <Code size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No code steps found in the workflow</p>
        </div>
      )}
    </div>
  );
};

export default CodingSteps;