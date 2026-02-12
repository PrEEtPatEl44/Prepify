"use client";

import { useRouter } from "next/navigation";
import { Navigation } from "@/components/sections/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { FooterSection } from "@/components/sections/FooterSection";

export default function LandingPage() {
  const router = useRouter();

  const handleNavigate = (page: "landing" | "login" | "signup") => {
    switch (page) {
      case "landing":
        router.push("/");
        break;
      case "login":
        router.push("/auth/login");
        break;
      case "signup":
        router.push("/auth/signup");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background ">
      <Navigation onNavigate={handleNavigate} currentPage="landing" />
      <HeroSection onNavigate={handleNavigate} />
      <HowItWorksSection onNavigate={handleNavigate} />
      <FeaturesSection onNavigate={handleNavigate} />
      <PricingSection onNavigate={handleNavigate} />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection onNavigate={handleNavigate} />
      <FooterSection onNavigate={handleNavigate} />
    </div>
  );
}
