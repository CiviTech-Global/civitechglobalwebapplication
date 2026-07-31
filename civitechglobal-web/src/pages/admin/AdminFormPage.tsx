import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { z } from "zod";
import api from "../../config/api";
import type { AdminRole, ApiResponse } from "../../types";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { useToast } from "../../hooks/useToast";
import { useLocale } from "../../hooks/useLocale";
import { emailSchema, requiredString } from "../../lib/validation";

const adminSchema = z.object({
  email: emailSchema(),
  firstName: requiredString(),
  lastName: requiredString(),
  adminRoleId: z.string().optional(),
});

type AdminForm = z.infer<typeof adminSchema>;

export default function AdminFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();
  const [copied, setCopied] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      adminRoleId: "",
    },
  });

  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const { data: rolesData } = useQuery({
    queryKey: ["roles-list"],
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<AdminRole[]>>("/roles?limit=100");
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (form: AdminForm) => {
      const payload: Record<string, string> = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
      };
      if (form.adminRoleId) payload.adminRoleId = form.adminRoleId;
      const { data } = await api.post<
        ApiResponse<{ username: string; password: string }>
      >("/users/admin", payload);
      return data.data;
    },
    onSuccess: (data) => {
      setCredentials(data);
      toast(t.admin.adminForm.createSuccess, "success");
    },
    onError: () => toast(t.admin.adminForm.createFailed, "error"),
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const roleOptions = [
    { value: "", label: t.admin.adminForm.selectRole },
    ...(rolesData?.map((r) => ({ value: r.id, label: r.name })) || []),
  ];

  const onSubmit = (data: AdminForm) => mutation.mutate(data);

  if (credentials) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          {t.admin.adminForm.generatedCredentials}
        </h1>

        <div className="space-y-4 bg-surface-200 rounded-xl border border-border-default p-6">
          <div>
            <label className="block text-xs text-text-muted mb-1">
              {t.admin.adminForm.username}
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-surface-100 px-3 py-2 rounded-lg text-brand-green-500 text-sm font-mono">
                {credentials.username}
              </code>
              <button
                onClick={() =>
                  copyToClipboard(credentials.username, "username")
                }
                className="p-2 rounded-lg hover:bg-surface-300 text-text-muted hover:text-text-primary transition-colors"
              >
                {copied === "username" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">
              {t.admin.adminForm.password}
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-surface-100 px-3 py-2 rounded-lg text-brand-green-500 text-sm font-mono">
                {credentials.password}
              </code>
              <button
                onClick={() =>
                  copyToClipboard(credentials.password, "password")
                }
                className="p-2 rounded-lg hover:bg-surface-300 text-text-muted hover:text-text-primary transition-colors"
              >
                {copied === "password" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-yellow-400 mt-4">
            {t.admin.adminForm.copyWarning}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => navigate("/admin/admins")}>{t.back}</Button>
          <Button
            variant="outline"
            onClick={() => {
              setCredentials(null);
              reset();
            }}
          >
            {t.admin.addNew}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={() => navigate("/admin/admins")}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {t.admin.adminForm.createTitle}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="firstName"
            label={t.admin.adminForm.firstName}
          />
          <FormField
            control={control}
            name="lastName"
            label={t.admin.adminForm.lastName}
          />
        </div>
        <FormField
          control={control}
          name="email"
          type="input"
          label={t.admin.adminForm.email}
          inputProps={{
            type: "email",
            placeholder: t.admin.adminForm.emailPlaceholder,
          }}
        />
        <FormField
          control={control}
          name="adminRoleId"
          type="select"
          label={t.admin.adminForm.role}
          options={roleOptions}
        />

        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {t.create}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/admins")}
          >
            {t.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
