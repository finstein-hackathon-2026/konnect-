"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Settings, Shield, User, Wallet, ChevronRight, LogOut } from "lucide-react";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast("Signed out successfully");
      router.push("/");
    } catch {
      toast("Failed to sign out", "error");
    }
  };

  const menuItems = [
    { icon: User, label: "Personal Information" },
    { icon: Wallet, label: "Payment Methods" },
    { icon: Shield, label: "Security & Privacy" },
    { icon: Settings, label: "App Settings" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen">
      <Header />

      <motion.main
        className="mx-auto max-w-2xl px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Avatar + Name */}
        <motion.div variants={itemVariants} className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 bg-foreground text-background rounded-full flex items-center justify-center text-3xl font-bold">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?"}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {user?.displayName || "Guest User"}
            </h1>
            <p className="text-gray-500">{user?.email || "Not signed in"}</p>
          </div>
        </motion.div>

        {/* Wallet Card */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="bg-[#111111] dark:bg-[#1C1C1E] text-white rounded-[24px] p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 font-medium">Konnect Wallet Balance</span>
              <Wallet className="text-white w-6 h-6" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-6">₹1,250.00</h2>
            <Button variant="primary" className="bg-white text-black hover:bg-gray-200 h-10 px-6 rounded-full"
              onClick={() => toast("Add money — coming soon!", "info")}>
              Add Money
            </Button>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div variants={itemVariants} className="space-y-4 mb-12">
          <h3 className="text-xl font-bold mb-4">Account</h3>
          {menuItems.map((item, index) => (
            <Card key={index} hoverEffect className="flex items-center justify-between cursor-pointer p-5"
              onClick={() => toast(`${item.label} — coming soon!`, "info")}>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-background rounded-lg">
                  <item.icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="font-semibold text-[15px]">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Card>
          ))}
        </motion.div>

        {/* Logout */}
        {user && (
          <motion.div variants={itemVariants} className="flex justify-center">
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
