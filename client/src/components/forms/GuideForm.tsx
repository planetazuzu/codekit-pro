/**
 * Guide Form - Refactored to use generic Form component
 */

import { z } from "zod";
import { Form, type FormField } from "./Form";
import { useCreateGuide, useUpdateGuide, type Guide } from "@/hooks/use-guides";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const guideSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título es muy largo"),
  description: z.string().min(1, "La descripción es requerida"),
  content: z.string().optional(),
  type: z.enum(["ui", "manual", "template", "reference"], {
    required_error: "Selecciona un tipo",
  }),
  tags: z.string().optional(),
  imageUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

type GuideFormData = z.infer<typeof guideSchema>;

interface GuideFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide?: Guide | null;
}

const guideTypes = [
  { value: "ui", label: "Guía UI" },
  { value: "manual", label: "Manual de Estilo" },
  { value: "template", label: "Plantilla" },
  { value: "reference", label: "Referencia" },
];

export function GuideForm({ open, onOpenChange, guide }: GuideFormProps) {
  const { toast } = useToast();
  const createGuide = useCreateGuide();
  const updateGuide = useUpdateGuide();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields: FormField<GuideFormData>[] = [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Ej: Naming Convention Guide",
      required: true,
    },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      options: guideTypes,
      required: true,
    },
    {
      name: "tags",
      label: "Tags (separados por comas)",
      type: "tags",
      placeholder: "Ej: best-practices, clean-code",
    },
    {
      name: "description",
      label: "Descripción",
      type: "textarea",
      placeholder: "Breve descripción de la guía...",
      rows: 3,
      required: true,
    },
    {
      name: "content",
      label: "Contenido (Markdown opcional)",
      type: "textarea",
      placeholder: "Escribe el contenido de la guía en Markdown...",
      rows: 8,
      className: "font-mono text-sm",
    },
    {
      name: "imageUrl",
      label: "URL de Imagen (opcional)",
      type: "url",
      placeholder: "https://ejemplo.com/imagen.png",
    },
  ];

  const defaultValues: Partial<GuideFormData> = {
    title: "",
    description: "",
    content: "",
    type: "ui",
    tags: "",
    imageUrl: "",
  };

  const getInitialValues = (): Partial<GuideFormData> | undefined => {
    if (!guide) return undefined;
    return {
      title: guide.title,
      description: guide.description,
      content: guide.content || "",
      type: guide.type as GuideFormData["type"],
      tags: guide.tags?.join(", ") || "",
      imageUrl: guide.imageUrl || "",
    };
  };

  const transformData = (data: GuideFormData): GuideFormData & { tags: string[] } => {
    const tagsArray = data.tags
      ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];
    return {
      ...data,
      tags: tagsArray,
      imageUrl: data.imageUrl || undefined,
      content: data.content || undefined,
    };
  };

  const handleSubmit = async (data: GuideFormData & { tags: string[]; imageUrl?: string; content?: string }) => {
    setIsSubmitting(true);
    try {
      if (guide) {
        await updateGuide.mutateAsync({
          id: guide.id,
          ...data,
        });
        toast({
          title: "Guía actualizada",
          description: "La guía ha sido actualizada correctamente.",
        });
      } else {
        await createGuide.mutateAsync(data);
        toast({
          title: "Guía creada",
          description: "La guía ha sido creada correctamente.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al guardar la guía.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      schema={guideSchema}
      fields={fields}
      title="Nueva Guía"
      editTitle="Editar Guía"
      open={open}
      onOpenChange={onOpenChange}
      initialValues={getInitialValues()}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitText="Crear"
      editSubmitText="Actualizar"
      isSubmitting={isSubmitting}
      isEdit={!!guide}
      transformData={transformData}
      className="max-w-3xl"
    />
  );
}

