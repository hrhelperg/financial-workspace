"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/browser";

export function SupabaseAuthInitializer() {
  useEffect(() => {
    void supabase.auth.getSession();
  }, []);

  return null;
}
