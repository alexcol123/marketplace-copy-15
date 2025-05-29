// components/(custom)/(workflow-steps)/HttpStepCard.tsx
"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Copy, Check, Send, Link, Code } from "lucide-react";
import { UnifiedStepData, STEP_THEMES } from "@/types/workflowSteps";
import BaseStepCard from "./BaseStepCard";

interface HttpStepCardProps {
  step: UnifiedStepData;
}

const HttpStepCard: React.FC<HttpStepCardProps> = ({ step }) => {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  // Safe function to get HTTP method
  const getHttpMethod = () => {
    const params = step.parameters || {};
    return params.method || 'GET';
  };

  // Safe function to get URL
  const getUrl = () => {
    const params = step.parameters || {};
    return params.url || 'No URL specified';
  };

  // Safe function to get method color
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-orange-100 text-orange-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Safe function to get method description
  const getMethodDescription = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'Retrieves data from the server';
      case 'POST': return 'Sends data to create new resources';
      case 'PUT': return 'Updates existing resources';
      case 'DELETE': return 'Removes resources from the server';
      case 'PATCH': return 'Partially updates existing resources';
      default: return 'Makes an HTTP request';
    }
  };

  // Safe function to get headers
  const getHeaders = () => {
    const params = step.parameters || {};
    if (params.headers?.parameters) {
      return params.headers.parameters;
    } else if (params.headers) {
      return params.headers;
    }
    return [];
  };

  // Safe function to get body
  const getBody = () => {
    const params = step.parameters || {};
    if (params.jsonBody) {
      return params.jsonBody;
    } else if (params.body) {
      return params.body;
    } else if (params.bodyParameters?.parameters) {
      return JSON.stringify(params.bodyParameters.parameters, null, 2);
    }
    return null;
  };

  // Generate cURL command
  const generateCurlCommand = () => {
    const method = getHttpMethod();
    const url = getUrl();
    const headers = getHeaders();
    const body = getBody();

    let curl = `curl -X ${method} "${url}"`;
    
    if (Array.isArray(headers)) {
      headers.forEach((header: any) => {
        if (header.name && header.value) {
          curl += ` \\\n  -H "${header.name}: ${header.value}"`;
        }
      });
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      curl += ` \\\n  -d '${body}'`;
    }

    return curl;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [key]: true });
      setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
    });
  };

  const method = getHttpMethod();
  const url = getUrl();
  const headers = getHeaders();
  const body = getBody();
  const curlCommand = generateCurlCommand();

  const httpContent = (
    <div className="space-y-4">
      {/* Method and URL */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={getMethodColor(method)}>
            {method.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Link className="h-3 w-3" />
            HTTP Request
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {getMethodDescription(method)}
        </p>
      </div>

      {/* URL */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Request URL
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(url, 'url')}
            className="h-8 px-2"
          >
            {copied.url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <div className="bg-gray-50 p-3 rounded border text-sm font-mono break-all">
          {url}
        </div>
      </div>

      {/* Headers */}
      {Array.isArray(headers) && headers.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Request Headers</h4>
          <div className="bg-gray-50 p-3 rounded border text-sm space-y-1">
            {headers.map((header: any, index: number) => (
              <div key={index} className="font-mono">
                <span className="text-blue-600">{header.name}:</span> {header.value}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      {body && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Request Body</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(body, 'body')}
              className="h-8 px-2"
            >
              {copied.body ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="bg-gray-50 p-3 rounded border text-sm font-mono max-h-32 overflow-y-auto">
            {body.substring(0, 300)}
            {body.length > 300 && '...'}
          </div>
        </div>
      )}

      {/* cURL Command */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <Code className="h-4 w-4" />
            cURL Command
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(curlCommand, 'curl')}
            className="h-8 px-2"
          >
            {copied.curl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <div className="bg-gray-900 text-green-400 p-3 rounded border text-sm font-mono max-h-32 overflow-y-auto">
          {curlCommand}
        </div>
      </div>

      {/* Testing Tips */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Send className="h-4 w-4" />
          Testing Tips
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Copy the cURL command to test in your terminal</li>
          <li>• Check the response status code and headers</li>
          <li>• Verify the request body format matches API expectations</li>
          <li>• Test with different data to ensure proper error handling</li>
        </ul>
      </div>
    </div>
  );

  return (
    <BaseStepCard
      step={step}
      theme={STEP_THEMES.http}
      icon={Globe}
      title="HTTP Request Step"
      description="This step makes an HTTP request to an external API or service to send or retrieve data."
    >
      {httpContent}
    </BaseStepCard>
  );
};

export default HttpStepCard;