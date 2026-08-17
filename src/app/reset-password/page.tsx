import Image from "next/image";
import { ResetPasswordForm } from "./reset-password-form";

// @supabase/ssr hardcodes flowType: "pkce" for both its browser and server
// clients (see node_modules/@supabase/ssr/dist/main/createBrowserClient.js)
// — Supabase's recovery email link always lands here as `?code=`. The code
// is only READ here and handed to the client component, which exchanges it
// via a Server Action (exchangeRecoveryCode in src/lib/auth/actions.ts) —
// not here, since a Server Component can't durably set the session cookie.
export default async function ResetPasswordPage(
  props: PageProps<"/reset-password">,
) {
  const searchParams = await props.searchParams;
  const code = searchParams.code;
  const codeParam = Array.isArray(code) ? code[0] : code;

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
          <ResetPasswordForm code={codeParam} />
        </div>
      </div>
    </div>
  );
}
