"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  name: string;
  email: string;
  avatar: string;
}

export function useUser() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.name ?? "Unknown",
        email: user.email ?? "",
        avatar: user.user_metadata?.avatar_url ?? "/default-avatar.png",
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  return { user, profile, loading };
}
