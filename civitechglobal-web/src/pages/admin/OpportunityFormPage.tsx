import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";
import api from "../../config/api";
import type { Opportunity } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Spinner } from "../../components/ui/Spinner";
import { useToast } from "../../hooks/useToast";
import { slugify } from "../../lib/utils";
import { useLocale } from "../../hooks/useLocale";
import { requiredString, slugSchema } from "../../lib/validation";

const opportunitySchema = z.object({
  title: requiredString(),
  slug: slugSchema().or(z.literal("")),
  description: requiredString(),
  requirements: z.string(),
  duration: requiredString(),
  location: requiredString(),
  type: z.string().optional(),
  opportunityType: z.enum(["INTERNSHIP", "JOB"]),
  isOpen: z.boolean(),
});

type OpportunityForm = z.infer<typeof opportunitySchema>;

const EMPTY_FORM: OpportunityForm = {
  title: "",
  slug: "",
  description: "",
  requirements: "",
  duration: "",
  location: "",
  type: "Remote",
  opportunityType: "INTERNSHIP",
  isOpen: true,
};

export default function OpportunityFormPage() {
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
  } = useForm<OpportunityForm>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: EMPTY_FORM,
  });

  const titleValue = watch("title");
  const slugValue = watch("slug");

  useEffect(() => {
    if (!slugValue && titleValue) {
      setValue("slug", slugify(titleValue), { shouldValidate: false });
    }
  }, [titleValue, slugValue, setValue]);

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (isEdit) {
      api.get(`/opportunities/admin/all?limit=100`).then(({ data }) => {
        const item = data.data.find((i: Opportunity) => i.id === id);
        if (item) {
          reset({
            title: item.title,
            slug: item.slug,
            description: item.description,
            requirements: item.requirements.join(", "),
            duration: item.duration,
            location: item.location,
            type: item.type,
            opportunityType: item.opportunityType || "INTERNSHIP",
            isOpen: item.isOpen,
          });
        }
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (form: OpportunityForm) => {
    const body = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description,
      requirements: form.requirements
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      duration: form.duration,
      location: form.location,
      type: form.type,
      opportunityType: form.opportunityType,
      isOpen: form.isOpen,
    };
    try {
      if (isEdit) {
        await api.put(`/opportunities/${id}`, body);
      } else {
        await api.post("/opportunities", body);
      }
      toast(t.admin.opportunityForm.saveSuccess, "success");
      navigate("/admin/opportunities");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || t.admin.opportunityForm.saveFailed;
      toast(message, "error");
    }
  };

  if (isEdit && titleValue === "" && slugValue === "")
    return <Spinner size="lg" />;

  return (
    <div>
      <Link
        to="/admin/opportunities"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-green-600 mb-6"
      >
        <BackArrow className="w-4 h-4" /> {t.opportunities.backToOpportunities}
      </Link>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {isEdit
          ? t.admin.opportunityForm.editTitle
          : t.admin.opportunityForm.createTitle}
      </h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="title"
            label={t.admin.opportunityForm.title}
          />
          <FormField
            control={control}
            name="slug"
            label={t.admin.opportunityForm.slug}
            inputProps={{
              placeholder: t.admin.opportunityForm.slugPlaceholder,
            }}
          />
          <FormField
            control={control}
            name="description"
            type="textarea"
            label={t.admin.opportunityForm.description}
          />
          <FormField
            control={control}
            name="requirements"
            label={t.admin.opportunityForm.requirements}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="duration"
              label={t.admin.opportunityForm.duration}
              inputProps={{
                placeholder: t.admin.opportunityForm.durationPlaceholder,
              }}
            />
            <FormField
              control={control}
              name="location"
              label={t.admin.opportunityForm.location}
              inputProps={{
                placeholder: t.admin.opportunityForm.locationPlaceholder,
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="type"
              label={t.admin.opportunityForm.type}
              inputProps={{
                placeholder: t.admin.opportunityForm.typePlaceholder,
              }}
            />
            <FormField
              control={control}
              name="opportunityType"
              type="select"
              label={t.admin.opportunityForm.opportunityType}
              options={[
                { value: "INTERNSHIP", label: t.opportunities.internship },
                { value: "JOB", label: t.opportunities.job },
              ]}
            />
          </div>
          <Controller
            name="isOpen"
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
                  {t.admin.opportunityForm.isOpen}
                </span>
              </label>
            )}
          />
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? t.edit : t.create}
            </Button>
            <Link to="/admin/opportunities">
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
