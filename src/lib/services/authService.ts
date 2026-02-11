"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function signupWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: process.env.NEXT_CALL_BACK_URL,
    },
  });

  if (error) {
    console.error("Error signing in with Google:", error.message);
    return { success: false, message: error.message };
  }

  if (!data.url) {
    console.error("No URL returned from OAuth provider");
    return { success: false, message: "No URL returned from OAuth provider" };
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
