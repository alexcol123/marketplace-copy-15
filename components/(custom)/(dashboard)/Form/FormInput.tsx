'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Type } from "lucide-react";

type FormInputProps = {
  name: string;
  type: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  helperText?: string;
};

const FormInput = ({
  label,
  name,
  type,
  defaultValue,
  placeholder,
  required = true,
  className = "",
  helperText,
}: FormInputProps) => {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="text-sm font-medium mb-4 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-primary" />
            <span className="capitalize">{label || name}</span>
            {required && <span className="text-destructive ml-1">*</span>}
          </div>
        </Label>
      </div>

      <div className="relative rounded-md overflow-hidden border transition-all duration-200 border-input hover:border-primary/50 focus-within:border-primary">
        <Input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder || label || name}
          required={required}
          className={cn(
            "border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
            className
          )}
        />
      </div>
      
      {helperText && (
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <div>{helperText}</div>
        </div>
      )}
    </div>
  );
};

export default FormInput;