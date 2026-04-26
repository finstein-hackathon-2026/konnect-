import { useEffect, useState } from "react";
import { getJobs, createJob } from "@/lib/api";
import { socket } from "@/lib/socket";
import { JobCard } from "@/components/JobCard";
import { ServiceGrid } from "@/components/ServiceGrid";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Mock User ID since we don't have a login page yet
  const MOCK_USER_ID = "60c72b2f9b1d8b001c8e4b8a"; // Some valid looking ObjectId

  useEffect(() => {
    // 1. Fetch initial jobs
    getJobs()
      .then((res: any) => {
        setJobs(res.data || []);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setLoading(false);
        setError("Could not connect to server. Make sure your backend is running.");
      });

    // 2. Register socket identity
    socket.emit("register", { role: "client", userId: MOCK_USER_ID });

    // 3. Listen for socket events
    const handleNewJob = (job: any) => {
      setJobs((prev) => [job, ...prev]);
    };

    const handleJobUpdated = (updatedJob: any) => {
      setJobs((prev) =>
        prev.map((job) => (job._id === updatedJob._id ? updatedJob : job))
      );
    };

    socket.on("new_job", handleNewJob);
    socket.on("job_updated", handleJobUpdated);

    return () => {
      socket.off("new_job", handleNewJob);
      socket.off("job_updated", handleJobUpdated);
    };
  }, []);

  const handleCreateJob = async (serviceName: string) => {
    try {
      const res = await createJob({
        userId: MOCK_USER_ID,
        service: serviceName,
        description: `I need a professional ${serviceName} service as soon as possible.`,
      });
      navigate(`/jobs/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create job. Check console.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12">
      <header className="flex justify-between items-center mb-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">KoNNecT</h1>
          <p className="text-muted-foreground mt-1">Premium Service Marketplace</p>
        </motion.div>
        
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-10 h-10 p-0"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </header>

      <section className="mb-16">
        <motion.h2 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xl font-semibold mb-6 tracking-tight"
        >
          What do you need help with?
        </motion.h2>
        <ServiceGrid onSelect={handleCreateJob} />
      </section>

      <section>
        <motion.h2 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xl font-semibold mb-6 tracking-tight"
        >
          Active Requests
        </motion.h2>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400 border border-dashed border-red-400/30 rounded-2xl">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
            {jobs.length === 0 && (
              <div className="col-span-full p-12 text-center text-muted-foreground border border-dashed rounded-2xl">
                No active jobs. Select a service above to create one.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
