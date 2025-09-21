"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { signup, signupWithGoogle } from "@/lib/services/authService";
import { Separator } from "./ui/separator";
import { FaGoogle } from "react-icons/fa";
import { redirect } from "next/navigation";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);

    const result = await signup(formData);
    if (!result.success) {
      setError(result.message || "An error occurred");
      setIsLoading(false);
    } else {
      redirect("/auth/signup-success");
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6 font-archivo", className)}
      {...props}
    >
      <Card className="px-10 ">
        <CardHeader>
          <CardTitle className="text-2xl font-medium flex flex-col gap-2 items-center justify-center size-full">
            <span className="mb-2">Signup</span>
            <div className="relative  w-full mb-5">
              <Separator
                orientation="horizontal"
                className="bg-gray-200 flex"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-[#636AE8]"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-[#636AE8] hover:bg-[#4e57c1]"
                disabled={isLoading}
              >
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>

              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
              <div className="flex items-center w-full gap-2">
                <Separator
                  orientation="horizontal"
                  className="bg-gray-200 flex-1"
                />
                <span className="text-sm text-gray-500">or</span>
                <Separator
                  orientation="horizontal"
                  className="bg-gray-200 flex-1"
                />
              </div>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => handleSignupWithGoogle()}
              >
                <FaGoogle className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
