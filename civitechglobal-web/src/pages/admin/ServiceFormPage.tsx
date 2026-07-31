import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";
import api from "../../config/api";
import type { Service } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Spinner } from "../../components/ui/Spinner";
import { useToast } from "../../hooks/useToast";
import { slugify } from "../../lib/utils";
import { useLocale } from "../../hooks/useLocale";
import {
  requiredString,
  slugSchema,
  urlSchema,
  positiveNumberSchema,
} from "../../lib/validation";

const serviceSchema = z.object({
  name: requiredString(),
  slug: slugSchema().or(z.literal("")),
  description: requiredString(),
  price: positiveNumberSchema(),
  category: z.string().optional(),
  features: z.string(),
  image: urlSchema(),
  isActive: z.boolean(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

const EMPTY_FORM: ServiceForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  category: "",
  features: "",
  image: "",
  isActive: true,
};

export default function ServiceFormPage() {
  const { t, isRtl } = useLocale();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: EMPTY_FORM,
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  useEffect(() => {
    if (!slugValue && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, slugValue, setValue]);

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (isEdit) {
      api.get(`/services?limit=100`).then(({ data }) => {
        const service = data.data.find((s: Service) => s.id === id);
        if (service) {
          reset({
            name: service.name,
            slug: service.slug,
            description: service.description,
            price: service.price ? String(service.price) : "",
            category: service.category || "",
            features: service.features.join(", "),
            image: service.image || "",
            isActive: service.isActive,
          });
        }
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (form: ServiceForm) => {
    const body = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      price: form.price ? parseFloat(form.price) : null,
      category: form.category || undefined,
      features: form.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      image: form.image || undefined,
      isActive: form.isActive,
    };
    try {
      if (isEdit) {
        await api.put(`/services/${id}`, body);
      } else {
        await api.post("/services", body);
      }
      toast(t.admin.serviceForm.saveSuccess, "success");
      navigate("/admin/services");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || t.admin.serviceForm.saveFailed;
      toast(message, "error");
    }
  };

  if (isEdit && nameValue === "" && slugValue === "")
    return <Spinner size="lg" />;

  return (
    <div>
      <Link
        to="/admin/services"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-green-600 mb-6"
      >
        <BackArrow className="w-4 h-4" /> {t.services.backToServices}
      </Link>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {isEdit
          ? t.admin.serviceForm.editTitle
          : t.admin.serviceForm.createTitle}
      </h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="name"
            label={t.admin.serviceForm.name}
          />
          <FormField
            control={control}
            name="slug"
            label={t.admin.serviceForm.slug}
            inputProps={{ placeholder: t.admin.serviceForm.slugPlaceholder }}
          />
          <FormField
            control={control}
            name="description"
            type="textarea"
            label={t.admin.serviceForm.description}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="price"
              type="input"
              label={t.admin.serviceForm.price}
              inputProps={{ type: "number", step: "0.01" }}
            />
            <FormField
              control={control}
              name="category"
              label={t.admin.serviceForm.category}
            />
          </div>
          <FormField
            control={control}
            name="features"
            label={t.admin.serviceForm.features}
            inputProps={{ placeholder: "feature1, feature2, ..." }}
          />
          <FormField
            control={control}
            name="image"
            type="input"
            label={t.admin.serviceForm.image}
            inputProps={{ type: "url" }}
          />
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="rounded"
                />
                <span className="text-text-secondary">
                  {t.admin.serviceForm.isActive}
                </span>
              </label>
            )}
          />
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? t.edit : t.create}
            </Button>
            <Link to="/admin/services">
              <Button variant="outline" type="button">
                {t.cancel}
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
