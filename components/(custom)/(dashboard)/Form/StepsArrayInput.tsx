// components/(custom)/(dashboard)/Form/StepArrayInput.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, AlertCircle, Info } from "lucide-react";

interface StepArrayInputProps {
  maxSteps?: number;
  placeholder?: string;
}

const StepArrayInput = ({
  maxSteps = 7,
  placeholder = "Describe this step of the workflow...",
}: StepArrayInputProps) => {
  // Track if steps section is expanded
  const [isExpanded, setIsExpanded] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [focusedStep, setFocusedStep] = useState<number | null>(null);
  
  // Ref to store the container element for attaching global listeners
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('Steps array content:');
  console.log(steps);

  // Add global input event listener to catch programmatically triggered events
  useEffect(() => {
    const handleGlobalInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      
      // Only process events from our step textareas
      if (target.hasAttribute('data-step-index')) {
        const stepIndex = parseInt(target.getAttribute('data-step-index') || '0', 10);
        
        // Update our steps array with the current textarea value
        setSteps(prevSteps => {
          const newSteps = [...prevSteps];
          newSteps[stepIndex] = target.value;
          return newSteps;
        });
      }
    };

    // Get the container and add the listener
    const container = containerRef.current;
    if (container) {
      container.addEventListener('input', handleGlobalInput, true);
    }

    // Cleanup listener on unmount
    return () => {
      if (container) {
        container.removeEventListener('input', handleGlobalInput, true);
      }
    };
  }, []);

  const toggleSteps = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      // Initialize with one empty step when expanding
      setSteps([""]);
      setTimeout(() => setFocusedStep(0), 200);
    } else {
      // Collapse and clear steps
      setIsExpanded(false);
      setSteps([]);
    }
  };

  const addStep = () => {
    if (steps.length < maxSteps) {
      setSteps([...steps, ""]);
      // Focus the new step after render
      setTimeout(() => setFocusedStep(steps.length), 100);
    }
  };

  const removeStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);

    if (newSteps.length === 0) {
      // If all steps are removed, collapse the section
      setIsExpanded(false);
    } else {
      setSteps(newSteps);
    }
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  return (
    <div className="space-y-6" data-steps-container ref={containerRef}>
      {/* Hidden input to store the JSON string of steps */}
      <input
        type="hidden"
        name="steps"
        value={JSON.stringify(steps.filter((step) => step.trim() !== ""))}
      />

      {!isExpanded ? (
        <div className="bg-muted/20 rounded-lg p-6 border border-dashed border-primary/30">
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Info className="h-5 w-5" />
            <h3 className="font-medium">Optional Step-by-Step Instructions</h3>
          </div>

          <p className="text-muted-foreground text-center mb-6">
            Would you like to add step-by-step instructions to help users
            understand how this workflow operates?
          </p>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={toggleSteps}
              className="gap-1.5 border-primary/30 hover:border-primary text-primary transition-colors"
              data-add-steps-button
            >
              <Plus className="h-4 w-4" /> Add Steps (Optional)
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-primary">
                Step-by-Step Instructions
              </h3>
            </div>

            <Button
              type="button"
              variant="destructive"
              onClick={toggleSteps}
              className="text-muted-foreground hover:text-destructive transition-colors text-sm"
            >
              Cancel
            </Button>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex gap-3 items-start bg-background/50 p-4 rounded-lg border border-primary/10 shadow-sm transition-all duration-300 hover:border-primary/30"
              >
                {/* Step number circle */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                </div>

                {/* Text area */}
                <div className="flex-grow">
                  <Textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[100px] focus:border-primary focus:ring-primary/20 transition-colors"
                    data-step-index={index}
                    ref={(el) => {
                      if (el && focusedStep === index) {
                        el.focus();
                        setFocusedStep(null);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.length > 0
                      ? `${step.length} characters`
                      : "Enter details for this step"}
                  </p>
                </div>

                {/* Remove button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeStep(index)}
                  className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Remove step {index + 1}</span>
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            {/* Add step button */}
            {steps.length < maxSteps ? (
              <Button
                type="button"
                variant="outline"
                onClick={addStep}
                className="gap-1.5 border-primary/30 hover:border-primary text-primary transition-colors"
                data-add-step-button
              >
                <Plus className="h-4 w-4" /> Add Step {steps.length + 1}
              </Button>
            ) : (
              <p className="text-sm text-amber-500 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Maximum {maxSteps} steps reached
              </p>
            )}

            {/* Step counter */}
            <p className="text-sm text-muted-foreground">
              {steps.filter((step) => step.trim() !== "").length} of {maxSteps}{" "}
              steps used
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default StepArrayInput;