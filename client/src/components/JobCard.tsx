import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Clock, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function JobCard({ job }: { job: any }) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "assigned": return "bg-blue-500/10 text-blue-500";
      case "on_the_way": return "bg-purple-500/10 text-purple-500";
      case "arrived": return "bg-indigo-500/10 text-indigo-500";
      case "verified": return "bg-emerald-500/10 text-emerald-500";
      case "completed": return "bg-green-500/10 text-green-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/jobs/${job._id}`)}
      className="cursor-pointer"
    >
      <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Wrench className="w-5 h-5 text-muted-foreground" />
            {job.service}
          </CardTitle>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(job.status)}`}>
            {(job.status || "unknown").replace(/_/g, ' ')}
          </span>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2 mt-2">{job.description}</p>
          <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
