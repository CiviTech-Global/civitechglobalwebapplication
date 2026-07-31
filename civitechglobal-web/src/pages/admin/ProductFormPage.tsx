import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";
import api from "../../config/api";
import type { Product } from "../../types";
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

const productSchema = z.object({
  name: requiredString(),
  slug: slugSchema().or(z.literal("")),
  description: requiredString(),
  price: positiveNumberSchema(),
  category: z.string().optional(),
  features: z.string(),
  image: urlSchema(),
  githubUrl: urlSchema(),
  isActive: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;

const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  category: "",
  features: "",
  image: "",
  githubUrl: "",
  isActive: true,
};

export default function ProductFormPage() {
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
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
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
      api.get(`/products?limit=100`).then(({ data }) => {
        const product = data.data.find((p: Product) => p.id === id);
        if (product) {
          reset({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price ? String(product.price) : "",
            category: product.category || "",
            features: product.features.join(", "),
            image: product.image || "",
            githubUrl: product.githubUrl || "",
            isActive: product.isActive,
          });
        }
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (form: ProductForm) => {
    const body = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      price: form.price ? parseFloat(form.price) : undefined,
      category: form.category || undefined,
      features: form.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      image: form.image || undefined,
      githubUrl: form.githubUrl || undefined,
      isActive: form.isActive,
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, body);
      } else {
        await api.post("/products", body);
      }
      toast(t.admin.productForm.saveSuccess, "success");
      navigate("/admin/products");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || t.admin.productForm.saveFailed;
      toast(message, "error");
    }
  };

  if (isEdit && nameValue === "" && slugValue === "")
    return <Spinner size="lg" />;

  return (
    <div>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-green-600 mb-6"
      >
        <BackArrow className="w-4 h-4" /> {t.products.backToProducts}
      </Link>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {isEdit
          ? t.admin.productForm.editTitle
          : t.admin.productForm.createTitle}
      </h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="name"
            label={t.admin.productForm.name}
          />
          <FormField
            control={control}
            name="slug"
            label={t.admin.productForm.slug}
            inputProps={{ placeholder: t.admin.productForm.slugPlaceholder }}
          />
          <FormField
            control={control}
            name="description"
            type="textarea"
            label={t.admin.productForm.description}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="price"
              type="input"
              label={t.admin.productForm.price}
              inputProps={{ type: "number", step: "0.01" }}
            />
            <FormField
              control={control}
              name="category"
              label={t.admin.productForm.category}
            />
          </div>
          <FormField
            control={control}
            name="githubUrl"
            type="input"
            label={t.admin.productForm.githubUrl}
            inputProps={{ type: "url", placeholder: "https://github.com/..." }}
          />
          <FormField
            control={control}
            name="features"
            label={t.admin.productForm.features}
            inputProps={{
              placeholder: t.admin.productForm.featuresPlaceholder,
            }}
          />
          <FormField
            control={control}
            name="image"
            type="input"
            label={t.admin.productForm.image}
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
                  {t.admin.productForm.isActive}
                </span>
              </label>
            )}
          />
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? t.edit : t.create}
            </Button>
            <Link to="/admin/products">
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
