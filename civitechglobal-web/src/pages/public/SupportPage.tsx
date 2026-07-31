import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import api from "../../config/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { useLocale } from "../../hooks/useLocale";
import { requiredString, emailSchema } from "../../lib/validation";

const supportSchema = z.object({
  name: requiredString(),
  email: emailSchema(),
  subject: requiredString(),
  description: requiredString(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

type SupportForm = z.infer<typeof supportSchema>;

const EMPTY_FORM: SupportForm = {
  name: "",
  email: "",
  subject: "",
  description: "",
  priority: "MEDIUM",
};

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    reset({
      ...EMPTY_FORM,
      name: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
    });
  }, [user, reset]);

  const priorityOptions = [
    { value: "LOW", label: t.support.priorities.LOW },
    { value: "MEDIUM", label: t.support.priorities.MEDIUM },
    { value: "HIGH", label: t.support.priorities.HIGH },
    { value: "URGENT", label: t.support.priorities.URGENT },
  ];

  const onSubmit = async (data: SupportForm) => {
    try {
      await api.post("/tickets", data);
      toast(t.support.submitSuccess, "success");
      reset(EMPTY_FORM);
    } catch {
      toast(t.support.submitFailed, "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t.support.title}
        </h1>
        <p className="text-text-muted">{t.support.description}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="name"
                label={t.support.name}
                inputProps={{ placeholder: t.support.namePlaceholder }}
              />
              <FormField
                control={control}
                name="email"
                type="input"
                label={t.support.email}
                inputProps={{
                  type: "email",
                  placeholder: t.support.emailPlaceholder,
                }}
              />
            </div>
            <FormField
              control={control}
              name="subject"
              label={t.support.subject}
              inputProps={{ placeholder: t.support.subjectPlaceholder }}
            />
            <FormField
              control={control}
              name="description"
              type="textarea"
              label={t.support.description_field}
              textAreaProps={{ placeholder: t.support.descriptionPlaceholder }}
            />
            <FormField
              control={control}
              name="priority"
              type="select"
              label={t.support.priority}
              options={priorityOptions}
            />
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              {t.support.submitTicket}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
