import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useLocale } from "../../hooks/useLocale";
import { NeonButton } from "../../components/ui/NeonButton";
import { FormField } from "../../components/ui/FormField";
import { emailSchema, passwordSchema } from "../../lib/validation";
import logoSrc from "../../assets/logos/concept logo - no bg - white.png";

const loginSchema = z.object({
  email: emailSchema(),
  password: passwordSchema(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLocale();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const from =
    (location.state as { from?: { pathname?: string } } | undefined)?.from
      ?.pathname || "/dashboard";

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await login(data.email, data.password);
      toast(t.auth.loginSuccess, "success");
      const redirectTo =
        user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          ? "/admin"
          : from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || t.auth.invalidCredentials;
      toast(message, "error");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="relative rounded-2xl border border-border-default/50 bg-surface-200/90 backdrop-blur-xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          {/* Glow border effect */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-brand-green-500/20 via-transparent to-brand-amber-500/20 -z-10" />

          <div className="text-center mb-8">
            <img
              src={logoSrc}
              alt={t.brand}
              className="w-16 h-16 object-contain mx-auto mb-4 invert dark:invert-0 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            />
            <h1 className="text-2xl font-bold text-text-primary">
              {t.auth.welcomeBack}
            </h1>
            <p className="text-sm text-text-muted mt-1">{t.auth.signInTitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={control}
              name="email"
              type="input"
              label={t.auth.email}
              inputProps={{
                type: "email",
                placeholder: t.auth.emailPlaceholder,
              }}
            />
            <FormField
              control={control}
              name="password"
              type="input"
              label={t.auth.password}
              inputProps={{
                type: "password",
                placeholder: t.auth.passwordPlaceholder,
              }}
            />
            <NeonButton
              type="submit"
              isLoading={isSubmitting}
              className="w-full"
            >
              {t.auth.signIn}
            </NeonButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
