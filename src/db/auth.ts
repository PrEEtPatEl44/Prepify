import { createClient } from "@/utils/supabase/server";

/**
 * Get the authenticated user's ID from Supabase Auth.
 * Returns the user ID string, or null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}
