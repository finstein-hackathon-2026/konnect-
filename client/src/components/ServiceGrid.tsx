import { motion } from "framer-motion";
import { Wrench, Zap, Droplets, Home, PaintBucket, Truck } from "lucide-react";
import { Card } from "./ui/Card";

const services = [
  { name: "Plumbing", icon: <Droplets className="w-8 h-8" />, color: "text-blue-500" },
  { name: "Electrical", icon: <Zap className="w-8 h-8" />, color: "text-yellow-500" },
  { name: "Cleaning", icon: <Home className="w-8 h-8" />, color: "text-emerald-500" },
  { name: "Painting", icon: <PaintBucket className="w-8 h-8" />, color: "text-purple-500" },
  { name: "Moving", icon: <Truck className="w-8 h-8" />, color: "text-indigo-500" },
  { name: "Handyman", icon: <Wrench className="w-8 h-8" />, color: "text-orange-500" },
];

export function ServiceGrid({ onSelect }: { onSelect: (service: string) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {services.map((service, index) => (
        <motion.div
          key={service.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(service.name)}
          className="cursor-pointer"
        >
          <Card className="flex flex-col items-center justify-center p-6 gap-4 hover:border-primary/50 transition-colors bg-card/40 backdrop-blur-sm border-border/50">
            <div className={`${service.color} p-4 rounded-full bg-background shadow-sm`}>
              {service.icon}
            </div>
            <span className="font-medium text-foreground">{service.name}</span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
