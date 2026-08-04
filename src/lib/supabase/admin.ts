import { createClient } from "@supabase/supabase-js";

// SERVICE_ROLE key bypasses RLS — only import this from trusted server-side
// code (Server Actions, Route Handlers, proxy.ts), never from client code.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
