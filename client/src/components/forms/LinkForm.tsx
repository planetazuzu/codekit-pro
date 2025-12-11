/**
 * Link Form - Refactored to use generic Form component
 */

import { z } from "zod";
import { Form, type FormField } from "./Form";
import { useCreateLink, useUpdateLink, type Link } from "@/hooks/use-links";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const linkSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título es muy largo"),
  url: z.string().url("Debe ser una URL válida").min(1, "La URL es requerida"),
  icon: z.string().optional(),
  category: z.enum(["Dev", "Design", "Infrastructure", "Documentation", "VPS"], {
    required_error: "Selecciona una categoría",
  }),
  description: z.string().min(1, "La descripción es requerida"),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface LinkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link?: Link | null;
}

const categories = [
  { value: "Dev", label: "Dev" },
  { value: "Design", label: "Design" },
  { value: "Infrastructure", label: "Infrastructure" },
  { value: "Documentation", label: "Documentation" },
  { value: "VPS", label: "VPS" },
];

const icons = [
  { value: "Terminal", label: "Terminal" },
  { value: "Code2", label: "Code" },
  { value: "Palette", label: "Palette" },
  { value: "Database", label: "Database" },
  { value: "Globe", label: "Globe" },
  { value: "Github", label: "GitHub" },
  { value: "Cloud", label: "Cloud" },
  { value: "Link", label: "Link" },
  { value: "BookOpen", label: "Book" },
];

export function LinkForm({ open, onOpenChange, link }: LinkFormProps) {
  const { toast } = useToast();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields: FormField<LinkFormData>[] = [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Ej: GitHub",
      required: true,
    },
    {
      name: "url",
      label: "URL",
      type: "url",
      placeholder: "https://ejemplo.com",
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
      name: "icon",
      label: "Icono",
      type: "select",
      options: icons,
    },
    {
      name: "description",
      label: "Descripción",
      type: "textarea",
      placeholder: "Breve descripción del enlace...",
      rows: 3,
      required: true,
    },
  ];

  const defaultValues: Partial<LinkFormData> = {
    title: "",
    url: "",
    icon: "Code2",
    category: "Dev",
    description: "",
  };

  const getInitialValues = (): Partial<LinkFormData> | undefined => {
    if (!link) return undefined;
    return {
      title: link.title,
      url: link.url,
      icon: link.icon || "Code2",
      category: link.category as LinkFormData["category"],
      description: link.description,
    };
  };

  const handleSubmit = async (data: LinkFormData) => {
    setIsSubmitting(true);
    try {
      if (link) {
        await updateLink.mutateAsync({
          id: link.id,
          ...data,
        });
        toast({
          title: "Enlace actualizado",
          description: "El enlace ha sido actualizado correctamente.",
        });
      } else {
        await createLink.mutateAsync(data);
        toast({
          title: "Enlace creado",
          description: "El enlace ha sido creado correctamente.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al guardar el enlace.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      schema={linkSchema}
      fields={fields}
      title="Nuevo Enlace"
      editTitle="Editar Enlace"
      open={open}
      onOpenChange={onOpenChange}
      initialValues={getInitialValues()}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitText="Crear"
      editSubmitText="Actualizar"
      isSubmitting={isSubmitting}
      isEdit={!!link}
    />
  );
}

