import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface AnimatedSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

function AnimatedSearch({
  placeholder = "Search here....",
  onSearch,
  className = "",
}: AnimatedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const fullPlaceholder = placeholder;

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (placeholderIndex < fullPlaceholder.length) {
            setAnimatedPlaceholder(
              fullPlaceholder.slice(0, placeholderIndex + 1)
            );
            setPlaceholderIndex(placeholderIndex + 1);
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (placeholderIndex > 0) {
            setAnimatedPlaceholder(
              fullPlaceholder.slice(0, placeholderIndex - 1)
            );
            setPlaceholderIndex(placeholderIndex - 1);
          } else {
            setIsDeleting(false);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [placeholderIndex, isDeleting, fullPlaceholder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={animatedPlaceholder}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-golden focus:border-transparent transition-all duration-200"
        />
      </div>
    </form>
  );
}

export default AnimatedSearch;
