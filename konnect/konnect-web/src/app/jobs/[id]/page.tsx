"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Phone, MapPin, Star, CheckCircle2, ArrowRight, ScanLine, Car, UserCheck } from "lucide-react";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { subscribeToJob, simulateWorkerMovement, Job } from "@/services/jobService";

const STATUSES = ["assigned", "on_the_way", "arrived", "verified"] as const;

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending:    { label: "Looking for workers", icon: MapPin,        color: "text-gray-500" },
  matched:    { label: "Worker found",        icon: UserCheck,     color: "text-blue-500" },
  assigned:   { label: "Worker Assigned",     icon: CheckCircle2,  color: "text-blue-500" },
  on_the_way: { label: "On the Way",          icon: Car,           color: "text-orange-500" },
  arrived:    { label: "Worker Arrived",       icon: MapPin,        color: "text-green-500" },
  verified:   { label: "Verified ✓",          icon: CheckCircle2,  color: "text-green-600" },
  completed:  { label: "Completed",           icon: CheckCircle2,  color: "text-gray-400" },
};

export default function ActiveJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const simulationStarted = useRef(false);

  // Real-time Firestore listener
  useEffect(() => {
    if (!jobId) return;
    const unsubscribe = subscribeToJob(jobId, (updatedJob) => {
      setJob(updatedJob);
    });
    return () => unsubscribe();
  }, [jobId]);

  // Optional: simulate worker movement after assignment
  useEffect(() => {
    if (!job || simulationStarted.current) return;
    if (job.status === "assigned") {
      simulationStarted.current = true;
      const cleanup = simulateWorkerMovement(jobId);
      return () => cleanup();
    }
  }, [job?.status, jobId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statusIndex = job ? STATUSES.indexOf(job.status as any) : -1;

  return (
    <div className="min-h-screen">
      <Header />

      <motion.main
        className="mx-auto max-w-2xl px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {!job ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-pulse text-gray-400 text-lg">Loading job...</div>
          </div>
        ) : (
          <>
            {/* Title */}
            <motion.div variants={itemVariants} className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Active Job</p>
              <h1 className="text-3xl font-extrabold tracking-tight">{job.service}</h1>
              <p className="text-gray-500 mt-1">{job.description}</p>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div variants={itemVariants}>
              <Card className="mb-8 p-0 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 flex items-center justify-center">
                  <div className="flex items-center gap-6">
                    <Car className="w-8 h-8 text-foreground" />
                    <div className="w-20 h-1 bg-[var(--border)] rounded-full relative overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                        animate={{ width: ["0%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    <MapPin className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="p-4 text-center">
                  <span className="text-sm font-bold">
                    {job.status === "on_the_way" ? "ETA: ~7 min" : job.status === "arrived" ? "Worker is here" : "Tracking..."}
                  </span>
                </div>
              </Card>
            </motion.div>

            {/* Worker Card */}
            {job.workerName && (
              <motion.div variants={itemVariants}>
                <Card className="mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[var(--background)] rounded-full flex items-center justify-center text-xl font-bold shrink-0">
                      {job.workerName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{job.workerName}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="text-sm font-semibold text-orange-500">{job.workerRating || 4.8}</span>
                        <span className="text-sm text-gray-400 ml-1">Rating</span>
                      </div>
                    </div>
                    <button className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                      <Phone className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div variants={itemVariants} className="mb-8">
              <h3 className="text-lg font-bold mb-6">Status</h3>
              <div className="space-y-0 pl-2">
                {STATUSES.map((status, index) => {
                  const config = STATUS_CONFIG[status];
                  const isActive = index <= statusIndex;
                  const isCurrent = index === statusIndex;
                  const Icon = config.icon;

                  return (
                    <div key={status} className="flex gap-4" style={{ minHeight: 72 }}>
                      {/* Indicator */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isActive ? "bg-blue-500" : "bg-[var(--card)] ring-1 ring-border"
                          }`}
                          animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                        </motion.div>
                        {index < STATUSES.length - 1 && (
                          <div className={`w-0.5 flex-1 my-1 ${index < statusIndex ? "bg-blue-500" : "bg-[var(--border)]"}`} />
                        )}
                      </div>

                      {/* Label */}
                      <div className="pt-2">
                        <p className={`font-semibold ${isActive ? "text-foreground" : "text-gray-400"}`}>
                          {config.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-blue-500 mt-0.5">Current status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* QR Code + Verify Action */}
            <motion.div variants={itemVariants}>
              {job.status === "arrived" && !job.verified && (
                <Card className="text-center mb-8">
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Worker Verification QR</p>
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-4 rounded-2xl">
                      <QRCodeSVG value={jobId} size={180} level="H" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Show this QR to the worker, or scan their code</p>
                  <Button
                    variant="primary"
                    className="w-full gap-2"
                    onClick={() => router.push(`/jobs/${jobId}/verify`)}
                  >
                    <ScanLine className="w-5 h-5" />
                    Scan Worker&apos;s QR to Verify
                  </Button>
                </Card>
              )}

              {job.verified && !job.completed && (
                <Card className="text-center mb-8 bg-green-50 dark:bg-green-950/20 ring-green-200 dark:ring-green-900">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Worker Verified</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-6">
                    Verified at {job.verifiedAt ? new Date(job.verifiedAt.seconds * 1000).toLocaleTimeString() : "just now"}
                  </p>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => router.push(`/jobs/${jobId}/complete`)}
                  >
                    Mark Job as Complete
                  </Button>
                </Card>
              )}

              {job.completed && (
                <Card className="text-center mb-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-1">Job Completed</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Completed at {job.completedAt ? new Date(job.completedAt.seconds * 1000).toLocaleString() : "recently"}
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
                </Card>
              )}
            </motion.div>
          </>
        )}
      </motion.main>
    </div>
  );
}
