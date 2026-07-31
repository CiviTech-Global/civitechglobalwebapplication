import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useLocale } from "../../hooks/useLocale";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import {
  emailSchema,
  passwordSchema,
  requiredString,
} from "../../lib/validation";
import { Card } from "../../components/ui/Card";

const registerSchema = z.object({
  firstName: requiredString(),
  lastName: requiredString(),
  email: emailSchema(),
  password: passwordSchema(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const user = await register(data);
      toast(t.auth.registerSuccess, "success");
      const redirectTo =
        user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          ? "/admin"
          : "/dashboard";
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
        <Card>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-brand-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">CT</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t.auth.signUp}
            </h1>
            <p className="text-sm text-text-muted mt-1">{t.auth.signUpTitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="firstName"
                label={t.auth.firstName}
              />
              <FormField
                control={control}
                name="lastName"
                label={t.auth.lastName}
              />
            </div>
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
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              {t.auth.signUp}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            {t.auth.hasAccount}{" "}
            <Link
              to="/login"
              className="text-brand-green-600 dark:text-brand-green-400 hover:underline font-medium"
            >
              {t.auth.signIn}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
