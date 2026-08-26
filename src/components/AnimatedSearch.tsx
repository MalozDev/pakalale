"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AnimatedSearchProps {
  placeholder?: string;
  className?: string;
  onClick?: () => void;
}

export default function AnimatedSearch({
  placeholder = "Search here....",
  className = "",
  onClick,
}: AnimatedSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-10 bg-muted/50 border-border cursor-pointer"
        onClick={onClick}
        readOnly
      />
    </div>
  );
}
