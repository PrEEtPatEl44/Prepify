"use client";

import { Check, FileText, Layout, MessageSquare, Rocket } from "lucide-react";
import { SignUpForm } from "@/components/signup-form";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const benefits = [
    { icon: FileText, text: "Free resume scoring" },
    { icon: MessageSquare, text: "AI interview practice" },
    { icon: Layout, text: "Job application tracker" },
    { icon: Check, text: "No credit card required" },
  ];

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />

        <div
          className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--prepify-violet)) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-1/3 -left-20 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
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
              <Rocket className="w-4 h-4" />
              <span className="text-sm font-medium">Start for free</span>
            </div>
            <h2
              className="text-4xl xl:text-5xl font-bold text-foreground mb-4"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                lineHeight: 1.1,
              }}
            >
              Start your career
              <br />
              journey today
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Join thousands of job seekers who use Prepify to land their dream
              roles faster.
            </p>
          </div>

          <div
            className={`space-y-4 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SignUpForm />
    </div>
  );
};

export default Page;
