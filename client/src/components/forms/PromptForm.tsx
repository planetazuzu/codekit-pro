/**
 * Prompt Form - Refactored to use generic Form component
 */

import { z } from "zod";
import { Form, type FormField } from "./Form";
import { useCreatePrompt, useUpdatePrompt, type Prompt } from "@/hooks/use-prompts";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const promptSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título es muy largo"),
  category: z.enum(["IA", "Desarrollo", "Testing", "Diseño", "Mobile", "Refactor", "Documentación"], {
    required_error: "Selecciona una categoría",
  }),
  content: z.string().min(1, "El contenido es requerido"),
  tags: z.string().optional(),
});

type PromptFormData = z.infer<typeof promptSchema>;

interface PromptFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt | null;
}

const categories = [
  { value: "IA", label: "IA" },
  { value: "Desarrollo", label: "Desarrollo" },
  { value: "Testing", label: "Testing" },
  { value: "Diseño", label: "Diseño" },
  { value: "Mobile", label: "Mobile" },
  { value: "Refactor", label: "Refactor" },
  { value: "Documentación", label: "Documentación" },
];

export function PromptForm({ open, onOpenChange, prompt }: PromptFormProps) {
  const { toast } = useToast();
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields: FormField<PromptFormData>[] = [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Ej: Experto en React Performance",
      required: true,
    },
    {
      name: "category",
      label: "Categoría",
      type: "select",
      options: categories,
      required: true,
    },
    {
      name: "content",
      label: "Contenido del Prompt",
      type: "textarea",
      placeholder: "Escribe el contenido del prompt aquí...",
      rows: 8,
      required: true,
      className: "font-mono text-sm",
    },
    {
      name: "tags",
      label: "Tags (separados por comas)",
      type: "tags",
      placeholder: "Ej: react, performance, optimization",
      helperText: "Separa los tags con comas",
    },
  ];

  const defaultValues: Partial<PromptFormData> = {
    title: "",
    category: "Desarrollo",
    content: "",
    tags: "",
  };

  const getInitialValues = (): Partial<PromptFormData> | undefined => {
    if (!prompt) return undefined;
    return {
      title: prompt.title,
      category: prompt.category as PromptFormData["category"],
      content: prompt.content,
      tags: prompt.tags?.join(", ") || "",
    };
  };

  const transformData = (data: PromptFormData): PromptFormData & { tags: string[] } => {
    const tagsArray = data.tags
      ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];
    return {
      ...data,
      tags: tagsArray,
    };
  };

  const handleSubmit = async (data: PromptFormData & { tags: string[] }) => {
    setIsSubmitting(true);
    try {
      if (prompt) {
        await updatePrompt.mutateAsync({
          id: prompt.id,
          ...data,
        });
        toast({
          title: "Prompt actualizado",
          description: "El prompt ha sido actualizado correctamente.",
        });
      } else {
        await createPrompt.mutateAsync(data);
        toast({
          title: "Prompt creado",
          description: "El prompt ha sido creado correctamente.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al guardar el prompt.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      schema={promptSchema}
      fields={fields}
      title="Nuevo Prompt"
      editTitle="Editar Prompt"
      open={open}
      onOpenChange={onOpenChange}
      initialValues={getInitialValues()}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitText="Crear"
      editSubmitText="Actualizar"
      isSubmitting={isSubmitting}
      isEdit={!!prompt}
      transformData={transformData}
    />
  );
}

