"use client";

import { useState } from "react";
import { signupWithGoogle } from "@/lib/services/authService";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./logo";
import { GoogleAuthButton } from "./google-oauth-button";
import { useRouter } from "next/navigation";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    const result = await signupWithGoogle();
    if (!result.success) {
      setError(result.message || "An error occurred");
      setIsLoading(false);
    }
    // On success, the user is redirected by Supabase
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="lg:hidden mb-8 mt-8">
        <Logo />
      </div>

      <div className="max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Create your account
          </h1>
          <p className="text-muted-foreground">
            Sign up with Google to get started
          </p>
        </div>

        <div className="space-y-6">
          <GoogleAuthButton mode="signup" onClick={handleSignupWithGoogle} />

          {error && (
            <p className="text-sm text-center text-destructive">{error}</p>
          )}

          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
            <p className="text-sm text-center text-muted-foreground">
              {isLoading
                ? "Redirecting to Google..."
                : "We use Google Sign-In for a secure, passwordless experience."}
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="font-medium text-primary hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
