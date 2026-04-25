"use client";

import * as React from "react";
import { Card } from "./Card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceTileProps {
  label: string;
  icon: LucideIcon;
  bgColorClass: string;
  iconColorClass: string;
  onClick?: () => void;
}

export function ServiceTile({ label, icon: Icon, bgColorClass, iconColorClass, onClick }: ServiceTileProps) {
  return (
    <div onClick={onClick}>
      <Card hoverEffect className="flex flex-col items-center justify-center gap-4 cursor-pointer">
        <div className={cn("p-4 rounded-[16px]", bgColorClass)}>
          <Icon className={cn("w-8 h-8", iconColorClass)} />
        </div>
        <span className="font-semibold">{label}</span>
      </Card>
    </div>
  );
}
