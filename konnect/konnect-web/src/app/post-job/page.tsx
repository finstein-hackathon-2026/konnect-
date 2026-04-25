"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Droplet, Zap, Hammer, Sparkles, Paintbrush } from "lucide-react";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { createJob } from "@/services/jobService";

const SERVICES = [
  { id: "Plumber", icon: Droplet, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "Electrician", icon: Zap, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  { id: "Carpenter", icon: Hammer, color: "text-amber-700 dark:text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "Cleaner", icon: Sparkles, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  { id: "Painter", icon: Paintbrush, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
];

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedService, setSelectedService] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast("Please sign in first", "warning");
      return;
    }
    if (!selectedService) {
      toast("Please select a service", "warning");
      return;
    }
    if (!description.trim()) {
      toast("Please describe the issue", "warning");
      return;
    }

    setLoading(true);
    try {
      const jobId = await createJob(user.uid, selectedService, description.trim());
      toast("Job posted — finding workers!", "success");
      router.push(`/jobs/${jobId}`);
    } catch (err: any) {
      toast(err.message || "Failed to create job", "error");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen">
      <Header />
      <motion.main
        className="mx-auto max-w-2xl px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Post a Job</h1>
          <p className="text-gray-500">Select a service and describe the issue</p>
        </motion.div>

        {/* Service Selection */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Select Service</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              const isSelected = selectedService === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-[16px] ring-1 transition-all text-left ${
                    isSelected
                      ? "ring-foreground bg-foreground text-background font-semibold"
                      : "ring-border bg-[var(--card)] hover:ring-foreground/30"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? "" : s.color}`} />
                  <span className="text-sm font-medium">{s.id}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Describe the Issue</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Leaking pipe under the kitchen sink"
            rows={4}
            className="w-full rounded-[14px] bg-[var(--card)] ring-1 ring-border p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-foreground transition-all"
          />
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants}>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !selectedService || !description.trim()}
          >
            {loading ? "Posting..." : "Find Workers"}
          </Button>
        </motion.div>
      </motion.main>
    </div>
  );
}
