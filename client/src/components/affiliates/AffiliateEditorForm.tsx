/**
 * Affiliate Editor Form Component
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Affiliate, InsertAffiliate } from "@shared/schema";

const affiliateFormSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  category: z.string().min(1, "Categoría requerida"),
  url: z.string().url("URL inválida"),
  code: z.string().optional().nullable(),
  commission: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  utm: z.string().optional().nullable(),
});

type AffiliateFormData = z.infer<typeof affiliateFormSchema>;

interface AffiliateEditorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affiliate?: Affiliate | null;
  onSubmit: (data: InsertAffiliate) => Promise<void>;
  isSubmitting: boolean;
}

const CATEGORIES = [
  "Hosting",
  "Deployment",
  "Cloud",
  "IA",
  "IA & DevTools",
  "UI Kits",
  "Productividad",
  "Diseño",
  "Educación",
  "Desarrollo",
];

const ICONS = [
  "Server",
  "Rocket",
  "Cloud",
  "Terminal",
  "Github",
  "LayoutGrid",
  "Notebook",
  "Sparkles",
  "Brush",
  "Code",
  "Zap",
  "Database",
  "Globe",
  "Cpu",
  "Layers",
];

export function AffiliateEditorForm({
  open,
  onOpenChange,
  affiliate,
  onSubmit,
  isSubmitting,
}: AffiliateEditorFormProps) {
  const isEdit = !!affiliate;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AffiliateFormData>({
    resolver: zodResolver(affiliateFormSchema),
    defaultValues: {
      name: "",
      category: "",
      url: "",
      code: "",
      commission: "",
      icon: "",
      utm: "",
    },
  });

  const selectedCategory = watch("category");
  const selectedIcon = watch("icon");

  useEffect(() => {
    if (affiliate) {
      reset({
        name: affiliate.name,
        category: affiliate.category,
        url: affiliate.url,
        code: affiliate.code || "",
        commission: affiliate.commission || "",
        icon: affiliate.icon || "",
        utm: affiliate.utm || "",
      });
    } else {
      reset({
        name: "",
        category: "",
        url: "",
        code: "",
        commission: "",
        icon: "",
        utm: "",
      });
    }
  }, [affiliate, reset]);

  const handleFormSubmit = async (data: AffiliateFormData) => {
    await onSubmit({
      ...data,
      code: data.code || null,
      commission: data.commission || null,
      icon: data.icon || null,
      utm: data.utm || null,
    });
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Afiliado" : "Nuevo Afiliado"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ej: Hostinger"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">URL de afiliado *</Label>
            <Input
              id="url"
              type="url"
              {...register("url")}
              placeholder="https://ejemplo.com/?ref=TU-ID"
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          {/* Commission */}
          <div className="space-y-2">
            <Label htmlFor="commission">Comisión</Label>
            <Input
              id="commission"
              {...register("commission")}
              placeholder="Ej: 60%, $25 por registro"
            />
          </div>

          {/* Discount code */}
          <div className="space-y-2">
            <Label htmlFor="code">Código de descuento</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="Ej: CODEKIT20"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icono</Label>
            <Select
              value={selectedIcon || ""}
              onValueChange={(value) => setValue("icon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona icono" />
              </SelectTrigger>
              <SelectContent>
                {ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    {icon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* UTM */}
          <div className="space-y-2">
            <Label htmlFor="utm">Parámetros UTM</Label>
            <Input
              id="utm"
              {...register("utm")}
              placeholder="?utm_source=codekit&utm_medium=affiliate"
            />
            <p className="text-xs text-muted-foreground">
              Se añadirán automáticamente al enlace. Deja vacío para usar valores por defecto.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

