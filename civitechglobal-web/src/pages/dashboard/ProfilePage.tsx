import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../../config/api";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useLocale } from "../../hooks/useLocale";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  const [overrides, setOverrides] = useState<
    Partial<Record<"firstName" | "lastName" | "phone", string>>
  >({});

  const form = useMemo(
    () => ({
      firstName: overrides.firstName ?? user?.firstName ?? "",
      lastName: overrides.lastName ?? user?.lastName ?? "",
      phone: overrides.phone ?? user?.phone ?? "",
    }),
    [overrides, user],
  );

  const mutation = useMutation({
    mutationFn: async () => {
      await api.put(`/users/${user!.id}`, form);
    },
    onSuccess: () => {
      refreshUser();
      setOverrides({});
      toast(t.profile.updateSuccess, "success");
    },
    onError: () => toast(t.profile.updateFailed, "error"),
  });

  const update =
    (key: "firstName" | "lastName" | "phone") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setOverrides((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {t.profile.title}
      </h1>
      <Card className="max-w-lg">
        <h3 className="font-semibold text-text-primary mb-4">
          {t.profile.personalInfo}
        </h3>
        <div className="space-y-4">
          <Input
            label={t.profile.firstName}
            value={form.firstName}
            onChange={update("firstName")}
          />
          <Input
            label={t.profile.lastName}
            value={form.lastName}
            onChange={update("lastName")}
          />
          <Input label={t.profile.email} value={user?.email || ""} disabled />
          <Input
            label={t.profile.phone}
            value={form.phone}
            onChange={update("phone")}
            placeholder={t.profile.phonePlaceholder}
          />
          <Button
            onClick={() => mutation.mutate()}
            isLoading={mutation.isPending}
          >
            {t.profile.saveChanges}
          </Button>
        </div>
      </Card>
    </div>
  );
}
