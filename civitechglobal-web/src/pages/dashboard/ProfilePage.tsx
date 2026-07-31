import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../config/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useLocale } from "../../hooks/useLocale";
import { requiredString, optionalString } from "../../lib/validation";

const profileSchema = z.object({
  firstName: requiredString(),
  lastName: requiredString(),
  phone: optionalString(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: async (form: ProfileForm) => {
      await api.put(`/users/${user!.id}`, form);
    },
    onSuccess: () => {
      refreshUser();
      toast(t.profile.updateSuccess, "success");
    },
    onError: () => toast(t.profile.updateFailed, "error"),
  });

  const onSubmit = (form: ProfileForm) => mutation.mutate(form);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {t.profile.title}
      </h1>
      <Card className="max-w-lg">
        <h3 className="font-semibold text-text-primary mb-4">
          {t.profile.personalInfo}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="firstName"
            label={t.profile.firstName}
          />
          <FormField
            control={control}
            name="lastName"
            label={t.profile.lastName}
          />
          <Input label={t.profile.email} value={user?.email || ""} disabled />
          <FormField
            control={control}
            name="phone"
            label={t.profile.phone}
            inputProps={{ placeholder: t.profile.phonePlaceholder }}
          />
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {t.profile.saveChanges}
          </Button>
        </form>
      </Card>
    </div>
  );
}
