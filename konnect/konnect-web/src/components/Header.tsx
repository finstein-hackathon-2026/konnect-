"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { LogIn, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();
  const { user, signInWithGoogle, signOut, loading } = useAuth();
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast("Signed in successfully");
    } catch {
      toast("Failed to sign in", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast("Signed out");
    } catch {
      toast("Failed to sign out", "error");
    }
  };

  return (
    <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold tracking-tight">
        Konnect
      </Link>
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex gap-6 font-medium text-sm text-gray-500 dark:text-gray-400">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "text-foreground" : "hover:text-foreground transition-colors"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />

        {!loading && (
          user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-foreground transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={handleLogin} className="gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )
        )}
      </div>
    </header>
  );
}
