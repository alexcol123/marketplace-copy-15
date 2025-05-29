// components/(custom)/(workflow-steps)/GenericStepCard.tsx
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Copy, 
  Check,
  Mail,
  Webhook,
  Database,
  Clock,
  FileText,
  Upload,
  Zap,
  Users,
  Calendar,
  Bell,
  MessageSquare
} from "lucide-react";
import { UnifiedStepData, STEP_THEMES } from "@/types/workflowSteps";
import BaseStepCard from "./BaseStepCard";

interface GenericStepCardProps {
  step: UnifiedStepData;
}

const GenericStepCard: React.FC<GenericStepCardProps> = ({ step }) => {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  // Get icon and description based on node type
  const getNodeInfo = () => {
    const nodeType = step.type?.toLowerCase() || '';
    
    if (nodeType.includes('gmail') || nodeType.includes('email')) {
      return {
        icon: Mail,
        category: 'Email',
        color: 'bg-red-100 text-red-800',
        description: 'Handles email operations like sending, receiving, or managing messages'
      };
    } else if (nodeType.includes('webhook') || nodeType.includes('form')) {
      return {
        icon: Webhook,
        category: 'Webhook/Form',
        color: 'bg-orange-100 text-orange-800',
        description: 'Receives data from external sources or web forms'
      };
    } else if (nodeType.includes('drive') || nodeType.includes('storage')) {
      return {
        icon: Upload,
        category: 'File Storage',
        color: 'bg-blue-100 text-blue-800',
        description: 'Manages files and documents in cloud storage services'
      };
    } else if (nodeType.includes('wait') || nodeType.includes('delay')) {
      return {
        icon: Clock,
        category: 'Timing',
        color: 'bg-purple-100 text-purple-800',
        description: 'Pauses workflow execution for a specified time period'
      };
    } else if (nodeType.includes('merge') || nodeType.includes('join')) {
      return {
        icon: Zap,
        category: 'Data Processing',
        color: 'bg-green-100 text-green-800',
        description: 'Combines or processes data from multiple sources'
      };
    } else if (nodeType.includes('if') || nodeType.includes('condition')) {
      return {
        icon: FileText,
        category: 'Logic',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Makes decisions based on conditions and routes data accordingly'
      };
    } else if (nodeType.includes('calendar')) {
      return {
        icon: Calendar,
        category: 'Calendar',
        color: 'bg-indigo-100 text-indigo-800',
        description: 'Manages calendar events and scheduling'
      };
    } else if (nodeType.includes('notification') || nodeType.includes('alert')) {
      return {
        icon: Bell,
        category: 'Notifications',
        color: 'bg-pink-100 text-pink-800',
        description: 'Sends notifications and alerts to users'
      };
    } else if (nodeType.includes('chat') || nodeType.includes('message')) {
      return {
        icon: MessageSquare,
        category: 'Messaging',
        color: 'bg-cyan-100 text-cyan-800',
        description: 'Handles chat and messaging operations'
      };
    } else {
      return {
        icon: Settings,
        category: 'Utility',
        color: 'bg-gray-100 text-gray-800',
        description: 'Performs specialized operations within the workflow'
      };
    }
  };

  // Get formatted parameters for display
  const getDisplayParameters = () => {
    const params = step.parameters || {};
    const displayParams: { [key: string]: any } = {};
    
    // Filter out complex objects and only show simple values
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        displayParams[key] = value;
      } else if (value && typeof value === 'object' && value.value) {
        displayParams[key] = value.value;
      }
    });
    
    return displayParams;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [key]: true });
      setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
    });
  };

  const nodeInfo = getNodeInfo();
  const displayParams = getDisplayParameters();
  const IconComponent = nodeInfo.icon;

  const genericContent = (
    <div className="space-y-4">
      {/* Node Type and Category */}
      <div className="flex flex-wrap gap-2">
        <Badge className={nodeInfo.color}>
          {nodeInfo.category}
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          {step.type.replace('n8n-nodes-base.', '')}
        </Badge>
      </div>

      {/* Node Description */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <IconComponent className="h-4 w-4" />
          What This Step Does
        </h4>
        <p className="text-sm text-gray-700">
          {nodeInfo.description}
        </p>
      </div>

      {/* Configuration Parameters */}
      {Object.keys(displayParams).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Key Configuration
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(JSON.stringify(displayParams, null, 2), 'params')}
              className="h-8 px-2"
            >
              {copied.params ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {Object.entries(displayParams).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-sm">
                  <span className="font-medium text-gray-600 min-w-0 flex-shrink-0">
                    {key}:
                  </span>
                  <span className="text-gray-800 font-mono break-all">
                    {typeof value === 'string' && value.length > 50 
                      ? `${value.substring(0, 50)}...` 
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Node Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong className="text-gray-600">Position:</strong>
          <p className="text-muted-foreground font-mono">
            [{step.position[0]}, {step.position[1]}]
          </p>
        </div>
        <div>
          <strong className="text-gray-600">Step Number:</strong>
          <p className="text-muted-foreground">
            {step.stepNumber}
          </p>
        </div>
      </div>

      {/* n8n Tips */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          n8n Tips
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Configure credentials if this node requires authentication</li>
          <li>• Test the node with sample data before running the full workflow</li>
          <li>• Check the node's documentation for advanced configuration options</li>
          <li>• Use expressions to dynamically set parameters based on previous steps</li>
        </ul>
      </div>

      {/* Quick Copy Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy(JSON.stringify(step.parameters, null, 2), 'fullConfig')}
          className="gap-1"
        >
          {copied.fullConfig ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          Copy Full Config
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy(step.type, 'nodeType')}
          className="gap-1"
        >
          {copied.nodeType ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          Copy Node Type
        </Button>
      </div>
    </div>
  );

  return (
    <BaseStepCard
      step={step}
      theme={STEP_THEMES.generic}
      icon={IconComponent}
      title={`${nodeInfo.category} Step`}
      description={nodeInfo.description}
    >
      {genericContent}
    </BaseStepCard>
  );
};

export default GenericStepCard;