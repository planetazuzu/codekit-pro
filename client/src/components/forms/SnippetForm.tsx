/**
 * Snippet Form - Refactored to use generic Form component
 */

import { z } from "zod";
import { Form, type FormField } from "./Form";
import { useCreateSnippet, useUpdateSnippet, type Snippet } from "@/hooks/use-snippets";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const snippetSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título es muy largo"),
  language: z.enum(["javascript", "typescript", "tsx", "bash", "json"], {
    required_error: "Selecciona un lenguaje",
  }),
  code: z.string().min(1, "El código es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  tags: z.string().optional(),
});

type SnippetFormData = z.infer<typeof snippetSchema>;

interface SnippetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snippet?: Snippet | null;
}

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX (React)" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
];

export function SnippetForm({ open, onOpenChange, snippet }: SnippetFormProps) {
  const { toast } = useToast();
  const createSnippet = useCreateSnippet();
  const updateSnippet = useUpdateSnippet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields: FormField<SnippetFormData>[] = [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Ej: React Functional Component",
      required: true,
    },
    {
      name: "language",
      label: "Lenguaje",
      type: "select",
      options: languages,
      required: true,
    },
    {
      name: "description",
      label: "Descripción",
      type: "textarea",
      placeholder: "Breve descripción del snippet...",
      rows: 2,
      required: true,
    },
    {
      name: "code",
      label: "Código",
      type: "textarea",
      placeholder: "Pega o escribe el código aquí...",
      rows: 12,
      required: true,
      className: "font-mono text-sm",
    },
    {
      name: "tags",
      label: "Tags (separados por comas)",
      type: "tags",
      placeholder: "Ej: react, component, hook",
    },
  ];

  const defaultValues: Partial<SnippetFormData> = {
    title: "",
    language: "typescript",
    code: "",
    description: "",
    tags: "",
  };

  const getInitialValues = (): Partial<SnippetFormData> | undefined => {
    if (!snippet) return undefined;
    return {
      title: snippet.title,
      language: snippet.language as SnippetFormData["language"],
      code: snippet.code,
      description: snippet.description,
      tags: snippet.tags?.join(", ") || "",
    };
  };

  const transformData = (data: SnippetFormData): SnippetFormData & { tags: string[] } => {
    const tagsArray = data.tags
      ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];
    return {
      ...data,
      tags: tagsArray,
    };
  };

  const handleSubmit = async (data: SnippetFormData & { tags: string[] }) => {
    setIsSubmitting(true);
    try {
      if (snippet) {
        await updateSnippet.mutateAsync({
          id: snippet.id,
          ...data,
        });
        toast({
          title: "Snippet actualizado",
          description: "El snippet ha sido actualizado correctamente.",
        });
      } else {
        await createSnippet.mutateAsync(data);
        toast({
          title: "Snippet creado",
          description: "El snippet ha sido creado correctamente.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al guardar el snippet.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      schema={snippetSchema}
      fields={fields}
      title="Nuevo Snippet"
      editTitle="Editar Snippet"
      open={open}
      onOpenChange={onOpenChange}
      initialValues={getInitialValues()}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitText="Crear"
      editSubmitText="Actualizar"
      isSubmitting={isSubmitting}
      isEdit={!!snippet}
      transformData={transformData}
      className="max-w-3xl"
    />
  );
}

