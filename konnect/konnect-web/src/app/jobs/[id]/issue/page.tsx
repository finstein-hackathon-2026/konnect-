"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { subscribeToJob, createReserviceJob, Job } from "@/services/jobService";

const ISSUE_TYPES = [
  "Same problem returned",
  "Incomplete work",
  "Poor quality",
  "Worker didn't follow instructions",
  "Other",
];

export default function IssuePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const unsubscribe = subscribeToJob(jobId, (updatedJob) => {
      setJob(updatedJob);
    });
    return () => unsubscribe();
  }, [jobId]);

  const handleSubmit = async () => {
    if (!selectedIssue) return;
    if (!job) return;

    setLoading(true);
    try {
      const description = `[RE-SERVICE] ${selectedIssue}${details ? `: ${details}` : ""}`;
      const newJobId = await createReserviceJob(jobId, job.userId, job.service, description);

      toast("Re-service request created!", "success");
      router.push(`/jobs/${newJobId}`);
    } catch (err: any) {
      toast(err.message || "Failed to create re-service request", "error");
    } finally {
      setLoading(false);
    }
  };

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
        className="mx-auto max-w-lg px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back */}
        <motion.div variants={itemVariants} className="mb-8">
          <button
            onClick={() => router.push(`/jobs/${jobId}/guarantee`)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to guarantee
          </button>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Report an Issue</h1>
          <p className="text-gray-500">
            We&apos;ll send another worker to fix the problem — covered by your Konnect Guarantee.
          </p>
        </motion.div>

        {/* Issue Type Selection */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">What went wrong?</p>
          <div className="space-y-3">
            {ISSUE_TYPES.map((issue) => (
              <button
                key={issue}
                onClick={() => setSelectedIssue(issue)}
                className={`w-full text-left px-5 py-4 rounded-[16px] ring-1 transition-all ${
                  selectedIssue === issue
                    ? "ring-foreground bg-foreground text-background font-semibold"
                    : "ring-border bg-[var(--card)] hover:ring-foreground/30"
                }`}
              >
                {issue}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Additional details (optional)</p>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe the issue in more detail..."
            rows={4}
            className="w-full rounded-[14px] bg-[var(--card)] ring-1 ring-border p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-foreground"
          />
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={!selectedIssue || loading}
          >
            {loading ? "Submitting..." : "Request Re-Service"}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push(`/jobs/${jobId}/guarantee`)}
          >
            Cancel
          </Button>
        </motion.div>
      </motion.main>
    </div>
  );
}
