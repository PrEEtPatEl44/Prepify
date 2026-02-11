"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { signupWithGoogle } from "@/lib/services/authService";
import { Separator } from "./ui/separator";
import { FaGoogle } from "react-icons/fa";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
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
    <div
      className={cn("flex flex-col gap-6 font-archivo", className)}
      {...props}
    >
      <Card className="px-10">
        <CardHeader>
          <CardTitle className="text-2xl font-medium flex flex-col gap-2 items-center justify-center size-full">
            <span className="mb-2">Login</span>
            <div className="relative  w-full mb-5">
              <Separator
                orientation="horizontal"
                className="bg-muted flex"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-primary"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="button"
              className="w-full"
              onClick={() => handleSignupWithGoogle()}
              disabled={isLoading}
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="underline underline-offset-4 text-primary hover:decoration-primary-hover"
              >
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
