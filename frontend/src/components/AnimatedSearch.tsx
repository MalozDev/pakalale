"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AnimatedSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function AnimatedSearch({
  placeholder = "Search here....",
  onSearch,
  className = "",
}: AnimatedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (placeholderIndex < placeholder.length) {
            setAnimatedPlaceholder(placeholder.slice(0, placeholderIndex + 1));
            setPlaceholderIndex(placeholderIndex + 1);
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (placeholderIndex > 0) {
            setAnimatedPlaceholder(placeholder.slice(0, placeholderIndex - 1));
            setPlaceholderIndex(placeholderIndex - 1);
          } else {
            setIsDeleting(false);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [placeholderIndex, isDeleting, placeholder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={animatedPlaceholder}
        className="pl-10 bg-muted/50 border-border"
      />
    </form>
  );
}
