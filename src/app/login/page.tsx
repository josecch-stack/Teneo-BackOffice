import Image from "next/image";
import { LoginForm } from "./login-form";

const ERROR_MESSAGES: Record<string, string> = {
  not_panel_user: "Esta cuenta no tiene acceso al panel de administración.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const errorParam = searchParams.error;
  const errorCode = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const message = errorCode ? ERROR_MESSAGES[errorCode] : undefined;

  return (
    <div className="bg-muted flex min-h-screen w-full items-center justify-center p-4">
      <div className="bg-card flex w-full max-w-[1440px] overflow-clip rounded-2xl shadow-lg">
        <div className="bg-muted relative hidden h-[900px] w-[364px] shrink-0 flex-col justify-between overflow-hidden p-8 md:flex">
          <Image
            src="/login-hero.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <Image
            src="/teneo-logo-white.png"
            alt="Teneo Pet"
            width={95}
            height={36}
            className="relative z-10"
          />
          <p className="relative z-10 text-xl font-bold text-white">
            La historia de tu mascota, siempre en tus manos
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-10 px-8 py-16">
          {message && (
            <p className="text-destructive max-w-sm text-center text-sm">
              {message}
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
