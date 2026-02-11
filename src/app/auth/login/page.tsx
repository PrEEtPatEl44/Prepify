"use client";

import { LoginForm } from "@/components/login-form";
import { Sparkles, Clock, Eye, FolderKanban } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  return (
    // <LoginForm className="w-full max-w-sm" />

    <div className="min-h-screen w-full bg-background flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />

        <div
          className="absolute top-1/4 -left-20 w-80 h-80 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--prepify-violet)) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div
            className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-primary mb-6 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Welcome back</span>
            </div>
            <h2
              className="text-4xl xl:text-5xl font-bold text-foreground mb-4"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                lineHeight: 1.1,
              }}
            >
              Continue your
              <br />
              journey to success
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Log in to access your resume scores, practice interviews, and job
              tracker.
            </p>
          </div>

          <div
            className={`flex gap-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {[
              { icon: Clock, title: "Save Time", description: "AI-powered resume scoring in seconds" },
              { icon: Eye, title: "Get Noticed", description: "Tailor your resume to every job" },
              { icon: FolderKanban, title: "Stay Organized", description: "Track all your applications in one place" },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {benefit.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {benefit.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <LoginForm />
    </div>
  );
}
