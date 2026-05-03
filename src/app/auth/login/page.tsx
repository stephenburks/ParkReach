"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trees, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    try {
      await supabase.auth.signInWithOtp({ email });
      setMagicLinkSent(true);
    } catch (error) {
      console.error("Magic link error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-bold"
        aria-label="ParkReach home"
      >
        <Trees className="h-8 w-8" />
        ParkReach
      </Link>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold">Welcome to ParkReach</h1>
        <p className="text-muted-foreground">
          Sign in to save parks and plan your visits
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {magicLinkSent ? (
          <div className="space-y-3">
            <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-lg text-center">
              <p className="text-sm text-stone-600 dark:text-stone-300">
                Check <strong>{email}</strong> for your magic link
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setMagicLinkSent(false)}
              className="w-full"
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <>
            <Button onClick={signIn} size="lg" className="w-full">
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-stone-200 dark:border-stone-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  or sign in with email
                </span>
              </div>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-park-bark dark:text-park-cream rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-park-forest/50"
                required
                aria-label="Email address"
              />
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? It'll be created automatically"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
