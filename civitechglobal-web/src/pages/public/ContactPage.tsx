import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { z } from "zod";
import api from "../../config/api";
import { NeonButton } from "../../components/ui/NeonButton";
import { FormField } from "../../components/ui/FormField";
import { GlowCard } from "../../components/ui/GlowCard";
import { AnimatedSection } from "../../components/ui/AnimatedSection";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { useLocale } from "../../hooks/useLocale";
import { requiredString, emailSchema } from "../../lib/validation";

const contactSchema = z.object({
  name: requiredString(),
  email: emailSchema(),
  subject: requiredString(),
  category: z.enum([
    "SUPPORT",
    "SALES",
    "DEMO_REQUEST",
    "PARTNERSHIP",
    "OTHER",
  ]),
  description: requiredString(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

type ContactForm = z.infer<typeof contactSchema>;

const EMPTY_FORM: ContactForm = {
  name: "",
  email: "",
  subject: "",
  category: "SUPPORT",
  description: "",
  priority: "MEDIUM",
};

export default function ContactPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    reset({
      ...EMPTY_FORM,
      name: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
    });
  }, [user, reset]);

  const categoryOptions = [
    { value: "SUPPORT", label: t.contact.categories.SUPPORT },
    { value: "SALES", label: t.contact.categories.SALES },
    { value: "DEMO_REQUEST", label: t.contact.categories.DEMO_REQUEST },
    { value: "PARTNERSHIP", label: t.contact.categories.PARTNERSHIP },
    { value: "OTHER", label: t.contact.categories.OTHER },
  ];

  const onSubmit = async (data: ContactForm) => {
    try {
      await api.post("/tickets", data);
      toast(t.contact.submitSuccess, "success");
      reset(EMPTY_FORM);
    } catch {
      toast(t.contact.submitFailed, "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t.contact.title}
        </h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          {t.contact.description}
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <AnimatedSection delay={0.1}>
            <GlowCard hover={false}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="name"
                    label={t.contact.name}
                    inputProps={{ placeholder: t.contact.namePlaceholder }}
                  />
                  <FormField
                    control={control}
                    name="email"
                    type="input"
                    label={t.contact.email}
                    inputProps={{
                      type: "email",
                      placeholder: t.contact.emailPlaceholder,
                    }}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="subject"
                    label={t.contact.subject}
                    inputProps={{ placeholder: t.contact.subjectPlaceholder }}
                  />
                  <FormField
                    control={control}
                    name="category"
                    type="select"
                    label={t.contact.category}
                    options={categoryOptions}
                  />
                </div>
                <FormField
                  control={control}
                  name="description"
                  type="textarea"
                  label={t.contact.message}
                  textAreaProps={{ placeholder: t.contact.messagePlaceholder }}
                />
                <NeonButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full gap-2"
                >
                  <Send className="w-4 h-4" /> {t.contact.submit}
                </NeonButton>
              </form>
            </GlowCard>
          </AnimatedSection>
        </div>

        <div>
          <AnimatedSection delay={0.2}>
            <GlowCard hover={false} glowColor="purple" className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">
                {t.contact.info.title}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-text-secondary">
                  <div className="w-10 h-10 rounded-lg bg-brand-green-600 flex items-center justify-center shadow-sm">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{t.contact.email}</p>
                    <p className="text-sm">{t.contact.info.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <div className="w-10 h-10 rounded-lg bg-brand-amber-500 flex items-center justify-center shadow-sm">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Location</p>
                    <p className="text-sm">{t.contact.info.location}</p>
                  </div>
                </div>
              </div>
            </GlowCard>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
