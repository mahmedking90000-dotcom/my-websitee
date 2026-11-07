"use client";

import { Suspense, type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  ArrowUpLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Fingerprint,
  Languages,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun
} from "lucide-react";

type Locale = "ar" | "en";
type Theme = "dark" | "light";

function LoginContent() {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>("ar");
  const [theme, setTheme] = useState<Theme>("dark");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("nova-workspace-language");
    if (storedLocale === "ar" || storedLocale === "en") setLocale(storedLocale);

    const currentTheme = document.documentElement.dataset.theme;
    if (currentTheme === "light" || currentTheme === "dark") setTheme(currentTheme);

    const syncTheme = () => {
      const nextTheme = document.documentElement.dataset.theme;
      if (nextTheme === "light" || nextTheme === "dark") setTheme(nextTheme);
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === "nova-workspace-language" && (event.newValue === "ar" || event.newValue === "en")) {
        setLocale(event.newValue);
      }
    };

    window.addEventListener("nova-preferences-change", syncTheme);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener("nova-preferences-change", syncTheme);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  function toggleLocale() {
    const next: Locale = locale === "ar" ? "en" : "ar";
    setLocale(next);
    window.localStorage.setItem("nova-workspace-language", next);
    document.cookie = `nova-workspace-language=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem("nova-theme", next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.dispatchEvent(new Event("nova-preferences-change"));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const requested = searchParams.get("callbackUrl");
      const callbackUrl = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/portal";
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        redirectTo: callbackUrl
      });
      if (result?.error) {
        setError(isArabic ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "The email or password is incorrect.");
      } else {
        window.location.assign(callbackUrl);
      }
    } catch {
      setError(isArabic ? "تعذر تسجيل الدخول حاليًا. حاول مرة أخرى." : "Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const registered = searchParams.get("registered") === "success";
  const verification = searchParams.get("verify");
  const notice = registered
    ? (isArabic ? "تم إنشاء حسابك بنجاح. سجّل الدخول للمتابعة." : "Your account is ready. Sign in to continue.")
    : verification === "success"
      ? (isArabic ? "يمكنك تسجيل الدخول إلى حسابك الآن." : "You can sign in to your account now.")
      : "";
  const verificationError = verification === "expired" || verification === "invalid"
    ? (isArabic ? "تأكيد البريد غير مفعّل حاليًا. يمكنك تسجيل الدخول مباشرة." : "Email confirmation is currently inactive. You can sign in directly.")
    : "";

  return (
    <main className="nova-login-page" dir={dir} lang={locale}>
      <div className="nova-login-frame">
        <aside className="nova-login-visual">
          <div className="nova-login-visual-top">
            <span className="nova-login-brand-mark"><Sparkles size={21} strokeWidth={1.8} /></span>
            <span className="nova-login-visual-brand">NOVA<span>.</span></span>
          </div>

          <div className="nova-login-art" aria-hidden="true">
            <div className="nova-login-art-grid" />
            <div className="nova-login-orbit nova-login-orbit-one" />
            <div className="nova-login-orbit nova-login-orbit-two" />
            <div className="nova-login-orbit nova-login-orbit-three" />
            <div className="nova-login-core">
              <div className="nova-login-core-glow" />
              <Fingerprint size={66} strokeWidth={1.05} />
              <span>N</span>
            </div>
            <div className="nova-login-float nova-login-float-one"><ShieldCheck size={19} /></div>
            <div className="nova-login-float nova-login-float-two"><LockKeyhole size={17} /></div>
            <div className="nova-login-float nova-login-float-three"><Sparkles size={17} /></div>
          </div>

          <div className="nova-login-visual-copy">
            <span className="nova-login-overline">{isArabic ? "مساحة عمل رقمية متكاملة" : "YOUR DIGITAL WORKSPACE"}</span>
            <h2>
              {isArabic ? "كل مشاريعك." : "Everything you build."}
              <br />
              <span>{isArabic ? "في مكان واحد." : "All in one place."}</span>
            </h2>
            <p>
              {isArabic
                ? "تابع مشاريعك، تواصل مع فريقنا، وابقَ على اطلاع بكل خطوة."
                : "Manage projects, connect with our team, and stay in control of every step."}
            </p>
          </div>

          <div className="nova-login-visual-footer">
            <span><i /> {isArabic ? "تجربة رقمية أكثر ذكاءً" : "A smarter digital experience"}</span>
            <span>01 / 01</span>
          </div>
        </aside>

        <section className="nova-login-panel">
          <div className="nova-login-toolbar">
            <Link href="/" className="nova-login-home" aria-label={isArabic ? "العودة إلى الرئيسية" : "Back to home"} title={isArabic ? "الرئيسية" : "Home"}>
              {isArabic ? <ArrowUpRight size={18} /> : <ArrowUpLeft size={18} />}
            </Link>
            <div className="nova-login-tools">
              <button
                type="button"
                onClick={toggleLocale}
                className="nova-login-icon-button"
                aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
                title={isArabic ? "English" : "العربية"}
              >
                <Languages size={18} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="nova-login-icon-button"
                aria-label={theme === "dark" ? (isArabic ? "تفعيل الوضع الفاتح" : "Switch to light mode") : (isArabic ? "تفعيل الوضع الداكن" : "Switch to dark mode")}
                title={theme === "dark" ? (isArabic ? "الوضع الفاتح" : "Light mode") : (isArabic ? "الوضع الداكن" : "Dark mode")}
              >
                {theme === "dark" ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          <div className="nova-login-content">
            <div className="nova-login-mobile-brand">
              <span className="nova-login-brand-mark"><Sparkles size={19} /></span>
              <span>NOVA<span>.</span></span>
            </div>

            <div className="nova-login-heading">
              <span className="nova-login-eyebrow"><LockKeyhole size={14} /> {isArabic ? "بوابة آمنة" : "SECURE ACCESS"}</span>
              <h1>{isArabic ? "مرحبًا بعودتك" : "Welcome back"}</h1>
              <p>{isArabic ? "سجّل الدخول إلى مساحتك الخاصة وتابع رحلتك مع NOVA." : "Sign in to your personal workspace and continue with NOVA."}</p>
            </div>

            {notice && <p role="status" className="nova-login-message nova-login-message-success">{notice}</p>}
            {(error || verificationError) && <p role="alert" className="nova-login-message nova-login-message-error">{error || verificationError}</p>}

            <form onSubmit={submit} className="nova-login-form">
              <label className="nova-login-field">
                <span>{isArabic ? "البريد الإلكتروني" : "Email address"}</span>
                <span className="nova-login-input-wrap">
                  <Mail size={18} />
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    dir="ltr"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="name@example.com"
                  />
                </span>
              </label>

              <label className="nova-login-field">
                <span>{isArabic ? "كلمة المرور" : "Password"}</span>
                <span className="nova-login-input-wrap">
                  <LockKeyhole size={18} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    dir="ltr"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder={isArabic ? "أدخل كلمة المرور" : "Enter your password"}
                  />
                  <button
                    type="button"
                    className="nova-login-password-toggle"
                    onClick={() => setShowPassword(value => !value)}
                    aria-label={showPassword ? (isArabic ? "إخفاء كلمة المرور" : "Hide password") : (isArabic ? "إظهار كلمة المرور" : "Show password")}
                    title={showPassword ? (isArabic ? "إخفاء كلمة المرور" : "Hide password") : (isArabic ? "إظهار كلمة المرور" : "Show password")}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>

              <div className="nova-login-forgot-row">
                <Link href="/forgot-password">{isArabic ? "نسيت كلمة المرور؟" : "Forgot password?"}</Link>
              </div>

              <button disabled={loading} type="submit" className="nova-login-submit">
                <span>{loading ? (isArabic ? "جارٍ تسجيل الدخول..." : "Signing in...") : (isArabic ? "تسجيل الدخول" : "Sign in")}</span>
                {!loading && (isArabic ? <ArrowUpLeft size={18} /> : <ArrowUpRight size={18} />)}
                {loading && <span className="nova-login-spinner" aria-hidden="true" />}
              </button>
            </form>

            <div className="nova-login-register">
              <span>{isArabic ? "ليس لديك حساب؟" : "Don’t have an account?"}</span>
              <Link href="/register">{isArabic ? "إنشاء حساب جديد" : "Create an account"}</Link>
            </div>

            <div className="nova-login-security">
              <ShieldCheck size={15} />
              <span>{isArabic ? "جلسة دخول محمية ومشفّرة" : "Protected and encrypted session"}</span>
            </div>
          </div>

          <div className="nova-login-panel-footer">
            <span>© NOVA Digital Agency</span>
            <span>{isArabic ? "صُنع بعناية للتجارب الرقمية" : "Crafted for digital experiences"}</span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<main className="nova-login-loading"><span className="nova-login-spinner" /></main>}>
      <LoginContent />
    </Suspense>
  );
}
