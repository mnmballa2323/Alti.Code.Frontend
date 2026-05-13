"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight } from "lucide-react";

import { searchAPI } from "@/lib/enterprise-api";

export function OmniSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSuggestions([]);
    }
  }, [isOpen]);

  // Handle Suggestions (Debounced)
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);

      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await searchAPI.suggest(query);

        setSuggestions(results);
      } catch (err) {
        console.error("Suggest error", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsOpen(false);
    router.push(`/enterprise/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      {/* OmniSearch Trigger Button */}
      <button
        className="flex items-center space-x-2 rounded-md bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors border border-zinc-800"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span>Search Enterprise...</span>
        <kbd className="hidden sm:inline-block rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] text-zinc-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
            >
              {/* Search Header */}
              <div className="flex items-center border-b border-zinc-800 px-4 py-4">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  ref={inputRef}
                  className="w-full bg-transparent px-4 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                  placeholder="Search agents, workflows, tenants, logs..."
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch(query);
                  }}
                />
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                ) : (
                  <button
                    className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Suggestions Body */}
              <div className="max-h-[60vh] overflow-y-auto w-full">
                {suggestions.length > 0 && (
                  <div className="p-2">
                    <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Suggestions
                    </div>
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left hover:bg-zinc-800/50 group transition-colors"
                        onClick={() => handleSearch(suggestion)}
                      >
                        <span className="text-zinc-300">{suggestion}</span>
                        <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {query.length >= 3 && suggestions.length === 0 && !loading && (
                  <div className="px-4 py-12 text-center text-sm text-zinc-500">
                    No suggestions found for{" "}
                    <span className="text-zinc-300">"{query}"</span>. Press
                    Enter to search anyway.
                  </div>
                )}

                {query.length < 3 && (
                  <div className="px-4 py-8 text-center text-sm text-zinc-500">
                    Type at least 3 characters to see suggestions.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
