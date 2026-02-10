"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Administration",
    subtitle: "Connectez-vous a votre compte",
    email: "Email",
    emailPlaceholder: "admin@letatche-bois.ma",
    password: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublie?",
    login: "Se connecter",
    loggingIn: "Connexion...",
    backToSite: "Retour au site",
    copyright: "Tous droits reserves.",
    errors: {
      invalidEmail: "Email invalide",
      passwordRequired: "Mot de passe requis",
      invalidCredentials: "Email ou mot de passe incorrect",
      unauthorized: "Acces non autorise. Veuillez vous connecter avec un compte administrateur.",
      generic: "Une erreur est survenue. Veuillez reessayer.",
    },
  },
  en: {
    title: "Administration",
    subtitle: "Sign in to your account",
    email: "Email",
    emailPlaceholder: "admin@letatche-bois.ma",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    login: "Sign in",
    loggingIn: "Signing in...",
    backToSite: "Back to site",
    copyright: "All rights reserved.",
    errors: {
      invalidEmail: "Invalid email",
      passwordRequired: "Password required",
      invalidCredentials: "Invalid email or password",
      unauthorized: "Unauthorized access. Please sign in with an admin account.",
      generic: "An error occurred. Please try again.",
    },
  },
  es: {
    title: "Administracion",
    subtitle: "Inicie sesion en su cuenta",
    email: "Correo electronico",
    emailPlaceholder: "admin@letatche-bois.ma",
    password: "Contrasena",
    passwordPlaceholder: "Ingrese su contrasena",
    rememberMe: "Recordarme",
    forgotPassword: "Olvido su contrasena?",
    login: "Iniciar sesion",
    loggingIn: "Iniciando sesion...",
    backToSite: "Volver al sitio",
    copyright: "Todos los derechos reservados.",
    errors: {
      invalidEmail: "Correo electronico invalido",
      passwordRequired: "Contrasena requerida",
      invalidCredentials: "Correo electronico o contrasena incorrectos",
      unauthorized: "Acceso no autorizado. Inicie sesion con una cuenta de administrador.",
      generic: "Ocurrio un error. Por favor intente de nuevo.",
    },
  },
  ar: {
    title: "الإدارة",
    subtitle: "قم بتسجيل الدخول إلى حسابك",
    email: "البريد الإلكتروني",
    emailPlaceholder: "admin@letatche-bois.ma",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    login: "تسجيل الدخول",
    loggingIn: "جاري تسجيل الدخول...",
    backToSite: "العودة للموقع",
    copyright: "جميع الحقوق محفوظة.",
    errors: {
      invalidEmail: "بريد إلكتروني غير صالح",
      passwordRequired: "كلمة المرور مطلوبة",
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      unauthorized: "وصول غير مصرح. يرجى تسجيل الدخول بحساب مسؤول.",
      generic: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Login Schema
// ═══════════════════════════════════════════════════════════

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
  remember: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ═══════════════════════════════════════════════════════════
// Login Page Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string };
}

export default function AdminLoginPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? `/${locale}/admin`;
  const errorParam = searchParams.get("error");

  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "unauthorized" ? t.errors.unauthorized : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.errors.invalidCredentials);
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(t.errors.generic);
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-800 to-amber-950 p-4"
    >
      <div className="w-full max-w-md">
        {/* Back to Site Link */}
        <Link
          href={`/${locale}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToSite}
        </Link>

        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Image
              src="/images/logo.png"
              alt="LE TATCHE BOIS"
              width={60}
              height={60}
              className="rounded-lg"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white">{t.title}</h1>
          <p className="mt-1 text-white/70">{t.subtitle}</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)(e);
            }}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t.email}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                error={errors.email?.message}
                disabled={isLoading}
                {...register("email")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t.password}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="current-password"
                  error={errors.password?.message}
                  disabled={isLoading}
                  className="pe-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600",
                    isRTL ? "left-3" : "right-3",
                    errors.password && "-translate-y-[calc(50%+12px)]"
                  )}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  disabled={isLoading}
                  {...register("remember")}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t.rememberMe}
                </span>
              </label>
              <Link
                href={`/${locale}/admin/forgot-password`}
                className="text-sm text-amber-600 transition-colors hover:text-amber-700 hover:underline"
              >
                {t.forgotPassword}
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="me-2 h-5 w-5 animate-spin" />
                  {t.loggingIn}
                </>
              ) : (
                t.login
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-white/60">
          &copy; {new Date().getFullYear()} LE TATCHE BOIS. {t.copyright}
        </p>
      </div>
    </div>
  );
}
