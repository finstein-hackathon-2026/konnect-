"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Star, ThumbsUp } from "lucide-react";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { completeJob } from "@/services/jobService";

export default function CompletePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeJob(jobId);
      toast("Job completed! Guarantee activated.", "success");
      setDone(true);
    } catch (err: any) {
      toast(err.message || "Failed to complete job", "error");
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
        {!done ? (
          <>
            <motion.div variants={itemVariants} className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-3xl mb-6">
                <ThumbsUp className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">How was the service?</h1>
              <p className="text-gray-500">Rate your experience with the worker</p>
            </motion.div>

            {/* Star Rating */}
            <motion.div variants={itemVariants} className="flex justify-center gap-3 mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= rating
                        ? "text-orange-500 fill-orange-500"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </motion.div>

            {/* Guarantee Notice */}
            <motion.div variants={itemVariants}>
              <Card className="mb-8 text-center">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Konnect Guarantee</p>
                <p className="text-2xl font-extrabold tracking-tight mb-1">72 Hours</p>
                <p className="text-sm text-gray-500">
                  Your service will be covered by our quality guarantee for 3 days after completion.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleComplete}
                disabled={loading}
              >
                {loading ? "Completing..." : "Confirm Completion"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push(`/jobs/${jobId}`)}
              >
                Go Back
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Job Completed!</h1>
            <p className="text-gray-500 mb-3">
              Thank you for using Konnect.
            </p>
            <p className="text-sm text-gray-400 mb-10">
              Your 72-hour quality guarantee is now active.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push(`/jobs/${jobId}/guarantee`)}
              >
                View Guarantee
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/")}
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
