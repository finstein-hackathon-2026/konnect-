import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJob, updateJob } from "@/lib/api";
import { socket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UserCircle2, CheckCircle2, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function JobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Fetch initial data
    getJob(id)
      .then((res: any) => {
        setJob(res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setLoading(false);
        setError("Could not load this job. The server may be offline.");
      });

    // Socket listener for real-time updates
    const handleJobUpdated = (updatedJob: any) => {
      if (updatedJob._id === id) {
        setJob(updatedJob);
      }
    };

    socket.on("job_updated", handleJobUpdated);

    return () => {
      socket.off("job_updated", handleJobUpdated);
    };
  }, [id]);

  const handleVerify = async () => {
    try {
      await updateJob(id!, { status: "verified" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async () => {
    try {
      await updateJob(id!, { status: "completed" });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500 bg-yellow-500/10";
      case "assigned": return "text-blue-500 bg-blue-500/10";
      case "on_the_way": return "text-purple-500 bg-purple-500/10";
      case "arrived": return "text-indigo-500 bg-indigo-500/10";
      case "verified": return "text-emerald-500 bg-emerald-500/10";
      case "completed": return "text-green-500 bg-green-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-medium mb-2">{error || "Job not found"}</p>
        <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12 min-h-screen flex flex-col">
      <header className="flex items-center mb-12">
        <Button variant="ghost" className="p-2 -ml-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-medium ml-2 tracking-tight">Request Details</h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2">{job.service}</h2>
            <p className="text-muted-foreground">{job.description}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium uppercase tracking-wider ${getStatusColor(job.status)}`}>
            {(job.status || "unknown").replace(/_/g, ' ')}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {job.status === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent mb-6 animate-pulse">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Finding the right expert</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We are matching your request with top-rated professionals nearby.
              </p>
            </motion.div>
          )}

          {job.status !== "pending" && (
            <motion.div
              key="worker-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Card className="overflow-hidden bg-card/50 backdrop-blur-md border-border/50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                      <UserCircle2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium">{job.workerName || "Assigned Pro"}</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>Verified Professional</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full w-12 h-12 p-0" onClick={() => window.location.href = "tel:0000000000"}>
                    <Phone className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>

              {/* Action Buttons based on status */}
              <div className="mt-8 space-y-4">
                {job.status === "arrived" && (
                  <Button size="lg" className="w-full" onClick={handleVerify}>
                    Verify Pro Identity
                  </Button>
                )}
                
                {job.status === "verified" && (
                  <Button size="lg" className="w-full" variant="success" onClick={handleComplete}>
                    Mark as Completed
                  </Button>
                )}

                {job.status === "completed" && (
                  <div className="text-center p-6 rounded-2xl bg-success/10 text-success">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Job Completed</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
