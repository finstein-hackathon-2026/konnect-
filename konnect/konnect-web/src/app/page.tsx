"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Droplet, Zap, Hammer, Sparkles, ShieldCheck, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Header } from "@/components/Header";
import { InputField } from "@/components/ui/InputField";
import { ServiceTile } from "@/components/ui/ServiceTile";
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

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);

  // Real-time listener on user's jobs
  useEffect(() => {
    if (!user) {
      setJobs([]);
      return;
    }

    const q = query(
      collection(db, "jobs"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated: Job[] = [];
      snapshot.forEach((doc) => {
        updated.push({ id: doc.id, ...doc.data() } as Job);
      });
      // Sort client-side
      updated.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setJobs(updated);
    });

    return () => unsubscribe();
  }, [user]);

  const activeJobs = jobs.filter((j) => j.status !== "completed");
  const recentJobs = jobs.filter((j) => j.status === "completed").slice(0, 3);

  const handleServiceClick = (service: string) => {
    if (!user) {
      router.push("/post-job");
      return;
    }
    router.push(`/post-job?service=${service}`);
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
        className="mx-auto max-w-4xl px-6 py-12 md:py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
            {user ? `Hello, ${user.displayName?.split(" ")[0] || "there"}` : "Good morning"}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            What can we help you with?
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Find trusted local workers instantly
          </p>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-16">
          <div onClick={() => router.push("/post-job")} className="cursor-pointer">
            <InputField
              icon={<Search className="w-5 h-5" />}
              placeholder="Search for a service..."
              readOnly
              className="cursor-pointer"
            />
          </div>
        </motion.div>

        {/* Service Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <ServiceTile label="Plumber" icon={Droplet} bgColorClass="bg-blue-100 dark:bg-blue-900/30" iconColorClass="text-blue-500" onClick={() => handleServiceClick("Plumber")} />
          <ServiceTile label="Electrician" icon={Zap} bgColorClass="bg-orange-100 dark:bg-orange-900/30" iconColorClass="text-orange-500" onClick={() => handleServiceClick("Electrician")} />
          <ServiceTile label="Carpenter" icon={Hammer} bgColorClass="bg-amber-100 dark:bg-amber-900/30" iconColorClass="text-amber-700 dark:text-amber-500" onClick={() => handleServiceClick("Carpenter")} />
          <ServiceTile label="Cleaner" icon={Sparkles} bgColorClass="bg-green-100 dark:bg-green-900/30" iconColorClass="text-green-500" onClick={() => handleServiceClick("Cleaner")} />
        </motion.div>

        {/* Active Jobs — Real-time */}
        {activeJobs.length > 0 && (
          <motion.div variants={itemVariants} className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Active Jobs</h3>
              <Link href="/jobs" className="text-blue-500 text-sm font-semibold">See all</Link>
            </div>
            <div className="space-y-4">
              {activeJobs.slice(0, 3).map((job) => {
                const Icon = SERVICE_ICONS[job.service] || Hammer;
                return (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card hoverEffect className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-[12px] flex items-center justify-center">
                          <Icon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{job.service}</h4>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">{job.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[job.status] || ""}`}>
                          {job.status.replace("_", " ").toUpperCase()}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400 hidden md:block" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Guarantee */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="bg-[#111111] dark:bg-[#1C1C1E] text-white rounded-[24px] p-8 flex items-center justify-between shadow-lg">
            <div>
              <h2 className="text-xl font-bold mb-2">Konnect Guarantee</h2>
              <p className="text-gray-400">Every service is backed by a 3-day protection</p>
            </div>
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Recent Bookings — Real-time */}
        {recentJobs.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recent Bookings</h3>
              <Link href="/jobs" className="text-blue-500 text-sm font-semibold">See all</Link>
            </div>
            <div className="space-y-4">
              {recentJobs.map((job) => {
                const Icon = SERVICE_ICONS[job.service] || Hammer;
                return (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card className="flex items-center justify-between opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-[12px] flex items-center justify-center">
                          <Icon className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{job.service}</h4>
                          <p className="text-sm text-gray-500">
                            {job.completedAt ? new Date(job.completedAt.seconds * 1000).toLocaleDateString() : "Completed"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state for signed-out users */}
        {!user && !authLoading && (
          <motion.div variants={itemVariants} className="text-center py-8">
            <Card className="max-w-md mx-auto">
              <p className="text-gray-500 mb-4">Sign in to post jobs and track your bookings in real-time.</p>
              <Button variant="primary" className="w-full" onClick={() => router.push("/post-job")}>
                Get Started
              </Button>
            </Card>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
