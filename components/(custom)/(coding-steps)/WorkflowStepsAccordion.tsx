// components/(custom)/(workflow)/WorkflowStepsAccordion.tsx
"use client";

import { useState } from "react";
import UnifiedStepCard from "./UnifiedStepCard";
import { type OrderedWorkflowStep } from "@/utils/functions/WorkflowStepsInOrder";

interface WorkflowStepsAccordionProps {
  steps: OrderedWorkflowStep[];
  className?: string;
}

export default function WorkflowStepsAccordion({
  steps,
  className = "",
}: WorkflowStepsAccordionProps) {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [viewedSteps, setViewedSteps] = useState<Set<string>>(new Set());

  // Handle when a step wants to expand
  const handleStepExpand = (stepId: string) => {
    // Close any currently expanded step and open the new one
    setExpandedStepId(stepId);
  };

  // Handle marking steps as viewed
  const handleToggleViewed = (stepId: string, isViewed: boolean) => {
    if (isViewed) {
      setViewedSteps(prev => new Set([...prev, stepId]));
    } else {
      setViewedSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepId);
        return newSet;
      });
    }
  };

  // Handle closing expanded step
  const handleStepClose = (stepId: string) => {
    if (expandedStepId === stepId) {
      setExpandedStepId(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => (
        <UnifiedStepCard
          key={step.id}
          step={step}
          stepNumber={index + 1}
          isExpanded={expandedStepId === step.id}
          isMarkedAsViewed={viewedSteps.has(step.id)}
          onExpand={handleStepExpand}
          onToggleExpanded={(stepId, isViewed) => {
            if (isViewed) {
              handleToggleViewed(stepId, true);
            } else {
              handleStepClose(stepId);
            }
          }}
        />
      ))}

      {/* Progress Summary */}
      {viewedSteps.size > 0 && (
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">
                Progress: {viewedSteps.size} of {steps.length} steps completed
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((viewedSteps.size / steps.length) * 100)}%
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-in-out"
              style={{ width: `${(viewedSteps.size / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Completion message */}
          {viewedSteps.size === steps.length && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  🎉 Congratulations! You've completed all workflow steps.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}