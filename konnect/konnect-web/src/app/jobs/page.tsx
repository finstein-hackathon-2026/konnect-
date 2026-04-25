"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Droplet, Hammer, Zap, Sparkles, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { Job } from "@/services/jobService";

const SERVICE_ICONS: Record<string, any> = {
  Plumber: Droplet,
  Electrician: Zap,
  Carpenter: Hammer,
  Cleaner: Sparkles,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
  matched: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  assigned: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  on_the_way: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  arrived: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  verified: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  completed: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
};

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);

  // Real-time listener
  useEffect(() => {
    if (!user) {
      setJobs([]);
      return;
    }

    const q = query(collection(db, "jobs"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated: Job[] = [];
      snapshot.forEach((doc) => {
        updated.push({ id: doc.id, ...doc.data() } as Job);
      });
      updated.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setJobs(updated);
    });

    return () => unsubscribe();
  }, [user]);

  const activeJobs = jobs.filter((j) => j.status !== "completed");
  const completedJobs = jobs.filter((j) => j.status === "completed");

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
        className="mx-auto max-w-4xl px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Jobs</h1>
            <p className="text-lg text-gray-500">Track and manage your service requests</p>
          </div>
          <Link href="/post-job">
            <Button variant="primary" className="gap-2">
              <Plus className="w-5 h-5" />
              New Job
            </Button>
          </Link>
        </motion.div>

        {!user && !authLoading && (
          <motion.div variants={itemVariants}>
            <Card className="text-center py-12">
              <p className="text-gray-500 mb-4">Sign in to see your jobs</p>
            </Card>
          </motion.div>
        )}

        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Active ({activeJobs.length})</h2>
            <div className="space-y-4">
              {activeJobs.map((job) => {
                const Icon = SERVICE_ICONS[job.service] || Hammer;
                return (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card hoverEffect className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-[14px] flex items-center justify-center shrink-0">
                          <Icon className="w-7 h-7 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{job.service}</h4>
                          <p className="text-sm text-gray-500 truncate max-w-[300px]">{job.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${STATUS_COLORS[job.status] || ""}`}>
                          <Clock className="w-4 h-4" />
                          {job.status.replace("_", " ").toUpperCase()}
                        </span>
                        <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Completed Jobs */}
        {completedJobs.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6">History ({completedJobs.length})</h2>
            <div className="space-y-4">
              {completedJobs.map((job) => {
                const Icon = SERVICE_ICONS[job.service] || Hammer;
                return (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity cursor-pointer mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-[12px] flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{job.service}</h4>
                          <p className="text-sm text-gray-500">
                            {job.completedAt ? new Date(job.completedAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Completed"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                        {job.guaranteeEndsAt && (
                          <Link href={`/jobs/${job.id}/guarantee`} className="text-xs text-blue-500 font-semibold hover:underline">
                            Guarantee
                          </Link>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {user && jobs.length === 0 && (
          <motion.div variants={itemVariants}>
            <Card className="text-center py-16">
              <p className="text-gray-500 mb-6">No jobs yet. Post your first service request!</p>
              <Link href="/post-job">
                <Button variant="primary" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Post a Job
                </Button>
              </Link>
            </Card>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
