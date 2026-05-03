import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string | null;
  example: string | null;
  order_index: number | null;
}

const Glossary = () => {
  const [search, setSearch] = useState("");

  const { data: terms, isLoading } = useQuery({
    queryKey: ["cs-glossary"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_glossary")
        .select("*")
        .order("term", { ascending: true });

      if (error) throw error;
      return (data as GlossaryTerm[]) || [];
    },
  });

  const filtered = useMemo(() => {
    if (!terms) return [];
    const q = search.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [terms, search]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-5 md:mb-6 lg:mb-10">
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold mb-3">
            Marketing Glossary
          </h1>
          <p className="text-[#6F767E] text-lg">
            Plain-English definitions of the terms you'll hear from our team.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6F767E]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms..."
            className="bg-[#1A1D1F] border-[#272B30] text-white placeholder:text-[#6F767E] pl-10 h-11 rounded-xl"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6 space-y-3"
              >
                <Skeleton className="h-6 w-1/3 bg-[#272B30]" />
                <Skeleton className="h-4 w-full bg-[#272B30]" />
                <Skeleton className="h-4 w-5/6 bg-[#272B30]" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6F767E]">No terms found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-white font-semibold text-lg">{t.term}</h3>
                  {t.category && (
                    <span className="text-[10px] uppercase tracking-wider text-[#6F767E] bg-[#272B30] px-2 py-1 rounded-full whitespace-nowrap">
                      {t.category}
                    </span>
                  )}
                </div>
                <p className="text-[#9A9FA5] text-sm leading-relaxed">
                  {t.definition}
                </p>
                {t.example && (
                  <div className="mt-4 bg-[#111315] border border-[#272B30] rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#6F767E] mb-1">
                      Example
                    </p>
                    <p className="text-[#9A9FA5] text-sm leading-relaxed">
                      {t.example}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Glossary;
