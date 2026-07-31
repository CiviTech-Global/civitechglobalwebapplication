import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import api from "../../config/api";
import type { AdminRole, ApiResponse } from "../../types";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Spinner } from "../../components/ui/Spinner";
import { useToast } from "../../hooks/useToast";
import { useLocale } from "../../hooks/useLocale";
import { requiredString } from "../../lib/validation";

const ALL_PERMISSIONS = [
  "products",
  "services",
  "opportunities",
  "orders",
  "tickets",
  "users",
  "content",
  "analytics",
  "roles",
  "admins",
];

const roleSchema = z.object({
  name: requiredString(),
  permissions: z.array(z.string()),
});

type RoleForm = z.infer<typeof roleSchema>;

export default function RoleFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-role", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminRole>>(`/roles/${id}`);
      return data.data;
    },
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", permissions: [] },
  });

  useEffect(() => {
    if (existing) {
      reset({ name: existing.name, permissions: existing.permissions });
    }
  }, [existing, reset]);

  const currentPermissions = watch("permissions");

  const mutation = useMutation({
    mutationFn: async (payload: RoleForm) => {
      if (isEdit) {
        await api.put(`/roles/${id}`, payload);
      } else {
        await api.post("/roles", payload);
      }
    },
    onSuccess: () => {
      toast(t.admin.roleForm.saveSuccess, "success");
      navigate("/admin/roles");
    },
    onError: () => toast(t.admin.roleForm.saveFailed, "error"),
  });

  const togglePermission = (perm: string) => {
    const next = currentPermissions.includes(perm)
      ? currentPermissions.filter((p) => p !== perm)
      : [...currentPermissions, perm];
    setValue("permissions", next, { shouldValidate: true });
  };

  const toggleAll = () => {
    const next =
      currentPermissions.length === ALL_PERMISSIONS.length
        ? []
        : [...ALL_PERMISSIONS];
    setValue("permissions", next, { shouldValidate: true });
  };

  const onSubmit = (form: RoleForm) => mutation.mutate(form);

  if (isEdit && isLoading) return <Spinner size="lg" />;

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate("/admin/roles")}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {isEdit ? t.admin.roleForm.editTitle : t.admin.roleForm.createTitle}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="name"
          label={t.admin.roleForm.name}
          inputProps={{ placeholder: t.admin.roleForm.namePlaceholder }}
        />

        <Controller
          name="permissions"
          control={control}
          render={() => (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-text-secondary">
                  {t.admin.roleForm.permissions}
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-brand-green-500 hover:text-brand-green-400"
                >
                  {currentPermissions.length === ALL_PERMISSIONS.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_PERMISSIONS.map((perm) => (
                  <label
                    key={perm}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      currentPermissions.includes(perm)
                        ? "border-brand-green-600 bg-brand-green-600 text-white"
                        : "border-border-default bg-surface-200/80 text-text-muted hover:border-border-strong"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={currentPermissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        currentPermissions.includes(perm)
                          ? "bg-brand-green-600 border-brand-green-500"
                          : "border-border-strong"
                      }`}
                    >
                      {currentPermissions.includes(perm) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm capitalize">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {t.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/roles")}
          >
            {t.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
