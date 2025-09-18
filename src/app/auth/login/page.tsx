import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 bg-[#f8f9fa] ">
      <LoginForm className="w-full max-w-sm" />
    </div>
  );
}
