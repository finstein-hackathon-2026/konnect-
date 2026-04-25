"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, Clock, AlertTriangle } from "lucide-react";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { subscribeToJob, getGuaranteeRemaining, Job } from "@/services/jobService";

export default function GuaranteePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [remaining, setRemaining] = useState(getGuaranteeRemaining(null));

  // Real-time listener
  useEffect(() => {
    if (!jobId) return;
    const unsubscribe = subscribeToJob(jobId, (updatedJob) => {
      setJob(updatedJob);
    });
    return () => unsubscribe();
  }, [jobId]);

  // Tick the countdown every minute
  useEffect(() => {
    if (!job?.guaranteeEndsAt) return;

    const update = () => setRemaining(getGuaranteeRemaining(job.guaranteeEndsAt));
    update(); // initial

    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [job?.guaranteeEndsAt]);

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
        {/* Shield Icon */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 ${
            remaining.expired 
              ? "bg-red-100 dark:bg-red-900/30" 
              : "bg-green-100 dark:bg-green-900/30"
          }`}>
            {remaining.expired ? (
              <ShieldAlert className="w-12 h-12 text-red-500" />
            ) : (
              <Shield className="w-12 h-12 text-green-500" />
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Konnect Guarantee</h1>
          <p className="text-gray-500">{job?.service || "Service"}</p>
        </motion.div>

        {/* Countdown Card */}
        <motion.div variants={itemVariants}>
          <Card className={`mb-8 text-center ${
            remaining.expired
              ? "bg-red-50 dark:bg-red-950/20 ring-red-200 dark:ring-red-900"
              : "bg-green-50 dark:bg-green-950/20 ring-green-200 dark:ring-green-900"
          }`}>
            {remaining.expired ? (
              <>
                <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p className="text-xl font-extrabold text-red-600 dark:text-red-400">Guarantee Expired</p>
                <p className="text-sm text-gray-500 mt-2">The 72-hour protection window has ended.</p>
              </>
            ) : (
              <>
                <Clock className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-4xl font-extrabold tracking-tight text-green-600 dark:text-green-400 mb-1">
                  {remaining.days > 0 && `${remaining.days}d `}{remaining.hours}h {remaining.minutes}m
                </p>
                <p className="text-sm text-gray-500">{remaining.label}</p>
              </>
            )}
          </Card>
        </motion.div>

        {/* What's Covered */}
        <motion.div variants={itemVariants}>
          <Card className="mb-8">
            <h3 className="font-bold text-lg mb-4">What&apos;s covered</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>If the same issue reoccurs within 72 hours, we&apos;ll send a worker for free.</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>Covers faulty workmanship or incomplete service.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span>Does not cover new, unrelated issues or user-caused damage.</span>
              </li>
            </ul>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="space-y-3">
          {!remaining.expired && (
            <Button
              variant="primary"
              className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => router.push(`/jobs/${jobId}/issue`)}
            >
              <AlertTriangle className="w-5 h-5" />
              Report an Issue
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </motion.div>
      </motion.main>
    </div>
  );
}
