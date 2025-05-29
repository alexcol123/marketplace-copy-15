// components/(custom)/(workflow-steps)/AIStepCard.tsx
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Copy, Check, Sparkles, MessageSquare, Settings } from "lucide-react";
import { UnifiedStepData, STEP_THEMES } from "@/types/workflowSteps";
import BaseStepCard from "./BaseStepCard";

interface AIStepCardProps {
  step: UnifiedStepData;
}

const AIStepCard: React.FC<AIStepCardProps> = ({ step }) => {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  // Safe function to get AI provider info from node type
  const getProviderInfo = () => {
    const nodeType = step.type?.toLowerCase() || '';
    
    if (nodeType.includes('openai')) {
      return { name: 'OpenAI', color: 'bg-green-100 text-green-800' };
    } else if (nodeType.includes('anthropic')) {
      return { name: 'Anthropic', color: 'bg-orange-100 text-orange-800' };
    } else if (nodeType.includes('google')) {
      return { name: 'Google AI', color: 'bg-blue-100 text-blue-800' };
    } else if (nodeType.includes('langchain')) {
      return { name: 'LangChain', color: 'bg-purple-100 text-purple-800' };
    } else {
      return { name: 'AI Service', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Safe function to get model info
  const getModelInfo = () => {
    const params = step.parameters || {};
    
    // Check various possible parameter structures
    if (params.model?.value) {
      return params.model.value;
    } else if (params.modelId?.value) {
      return params.modelId.value;
    } else if (params.model) {
      return typeof params.model === 'string' ? params.model : 'AI Model';
    } else {
      return 'Default Model';
    }
  };

  // Safe function to get system message
  const getSystemMessage = () => {
    const params = step.parameters || {};
    
    if (params.options?.systemMessage) {
      return params.options.systemMessage;
    } else if (params.systemMessage) {
      return params.systemMessage;
    } else {
      return null;
    }
  };

  // Safe function to get user prompt/text
  const getUserPrompt = () => {
    const params = step.parameters || {};
    
    if (params.text) {
      return params.text;
    } else if (params.messages?.values?.[0]?.content) {
      return params.messages.values[0].content;
    } else if (params.prompt) {
      return params.prompt;
    } else {
      return null;
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [key]: true });
      setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
    });
  };

  const providerInfo = getProviderInfo();
  const modelName = getModelInfo();
  const systemMessage = getSystemMessage();
  const userPrompt = getUserPrompt();

  const aiContent = (
    <div className="space-y-4">
      {/* Provider and Model Info */}
      <div className="flex flex-wrap gap-2">
        <Badge className={providerInfo.color}>
          {providerInfo.name}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Bot className="h-3 w-3" />
          {modelName}
        </Badge>
      </div>

      {/* AI Capabilities */}
      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
        <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Capabilities
        </h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Natural language processing and generation</li>
          <li>• Context-aware responses</li>
          <li>• Integration with workflow data</li>
          {systemMessage && <li>• Custom system instructions</li>}
        </ul>
      </div>

      {/* System Message */}
      {systemMessage && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Instructions
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(systemMessage, 'system')}
              className="h-8 px-2"
            >
              {copied.system ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="bg-gray-50 p-3 rounded border text-sm font-mono max-h-32 overflow-y-auto">
            {systemMessage.substring(0, 200)}
            {systemMessage.length > 200 && '...'}
          </div>
        </div>
      )}

      {/* User Prompt */}
      {userPrompt && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Prompt Template
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(userPrompt, 'prompt')}
              className="h-8 px-2"
            >
              {copied.prompt ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="bg-gray-50 p-3 rounded border text-sm font-mono max-h-32 overflow-y-auto">
            {userPrompt.substring(0, 200)}
            {userPrompt.length > 200 && '...'}
          </div>
        </div>
      )}

      {/* Quick Copy Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy(modelName, 'model')}
          className="gap-1"
        >
          {copied.model ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          Copy Model
        </Button>
        
        {systemMessage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(systemMessage, 'fullSystem')}
            className="gap-1"
          >
            {copied.fullSystem ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            Copy Instructions
          </Button>
        )}
        
        {userPrompt && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(userPrompt, 'fullPrompt')}
            className="gap-1"
          >
            {copied.fullPrompt ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            Copy Prompt
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <BaseStepCard
      step={step}
      theme={STEP_THEMES.ai}
      icon={Bot}
      title="AI Processing Step"
      description="This step uses artificial intelligence to process data, generate content, or make decisions based on the provided inputs."
    >
      {aiContent}
    </BaseStepCard>
  );
};

export default AIStepCard;