import Image from "next/image";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="bg-muted flex min-h-screen w-full flex-col items-center justify-center gap-6 p-4">
      <Image
        src="/teneo-logo-blue.png"
        alt="Teneo Pet"
        width={120}
        height={45}
        priority
        className="md:hidden"
      />
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
        <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12 md:px-8 md:py-16">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
