/**
 * Generic form component with React Hook Form + Zod integration
 */

import { ReactNode, useEffect } from "react";
import { useForm, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FieldType = "text" | "textarea" | "select" | "url" | "tags";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormField<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: SelectOption[];
  helperText?: string;
  className?: string;
  /** Grid column span (for grid layouts) */
  colSpan?: number;
  /** Group fields in a grid row */
  groupWith?: string[];
}

export interface FormProps<T extends FieldValues> {
  /** Form schema (Zod) */
  schema: z.ZodSchema<T>;
  /** Form fields configuration */
  fields: FormField<T>[];
  /** Form title */
  title: string;
  /** Edit mode title */
  editTitle?: string;
  /** Dialog open state */
  open: boolean;
  /** Dialog onOpenChange handler */
  onOpenChange: (open: boolean) => void;
  /** Initial values (for edit mode) */
  initialValues?: Partial<T>;
  /** Default values */
  defaultValues?: Partial<T>;
  /** Submit handler */
  onSubmit: (data: T) => Promise<void>;
  /** Submit button text */
  submitText?: string;
  /** Edit mode submit button text */
  editSubmitText?: string;
  /** Is submitting state */
  isSubmitting?: boolean;
  /** Is edit mode */
  isEdit?: boolean;
  /** Custom footer content */
  footer?: ReactNode;
  /** Additional className */
  className?: string;
  /** Transform data before submit */
  transformData?: (data: T) => T;
}

export function Form<T extends FieldValues>({
  schema,
  fields,
  title,
  editTitle,
  open,
  onOpenChange,
  initialValues,
  defaultValues,
  onSubmit,
  submitText = "Crear",
  editSubmitText = "Actualizar",
  isSubmitting = false,
  isEdit = false,
  footer,
  className,
  transformData,
}: FormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as T,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form;

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues) {
      reset(initialValues as T);
    } else if (defaultValues) {
      reset(defaultValues as T);
    }
  }, [initialValues, defaultValues, reset]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset(defaultValues as T);
    }
  }, [open, reset, defaultValues]);

  const handleFormSubmit = async (data: T) => {
    try {
      const transformedData = transformData ? transformData(data) : data;
      await onSubmit(transformedData);
      onOpenChange(false);
      reset(defaultValues as T);
    } catch (error) {
      // Error handling is done in parent component
      throw error;
    }
  };

  const renderField = (field: FormField<T>) => {
    const fieldName = field.name;
    const error = errors[fieldName];
    const value = watch(fieldName);

    switch (field.type) {
      case "text":
      case "url":
      case "tags":
        return (
          <div key={String(fieldName)} className={cn("space-y-2", field.className)}>
            <Label htmlFor={String(fieldName)}>
              {field.label} {field.required && "*"}
            </Label>
            <Input
              id={String(fieldName)}
              type={field.type === "url" ? "url" : "text"}
              {...register(fieldName)}
              placeholder={field.placeholder}
            />
            {error && (
              <p className="text-sm text-destructive">{error.message as string}</p>
            )}
            {field.helperText && !error && (
              <p className="text-xs text-muted-foreground">{field.helperText}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={String(fieldName)} className={cn("space-y-2", field.className)}>
            <Label htmlFor={String(fieldName)}>
              {field.label} {field.required && "*"}
            </Label>
            <Textarea
              id={String(fieldName)}
              {...register(fieldName)}
              rows={field.rows || 4}
              placeholder={field.placeholder}
              className={field.className}
            />
            {error && (
              <p className="text-sm text-destructive">{error.message as string}</p>
            )}
            {field.helperText && !error && (
              <p className="text-xs text-muted-foreground">{field.helperText}</p>
            )}
          </div>
        );

      case "select":
        if (!field.options) {
          return null;
        }
        return (
          <div key={String(fieldName)} className={cn("space-y-2", field.className)}>
            <Label htmlFor={String(fieldName)}>
              {field.label} {field.required && "*"}
            </Label>
            <Select
              value={value as string}
              onValueChange={(val) => setValue(fieldName, val as T[Path<T>])}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Selecciona ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-destructive">{error.message as string}</p>
            )}
            {field.helperText && !error && (
              <p className="text-xs text-muted-foreground">{field.helperText}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle>{isEdit ? (editTitle || title) : title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {fields.map(renderField)}

          <DialogFooter>
            {footer || (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Guardando..."
                    : isEdit
                    ? editSubmitText
                    : submitText}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Export form methods for advanced usage
export type { UseFormReturn };

