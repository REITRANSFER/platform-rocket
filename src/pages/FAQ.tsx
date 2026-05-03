import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search } from "lucide-react";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order_index: number | null;
}

const FAQ = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["cs-faqs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_faqs")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return (data as Faq[]) || [];
    },
  });

  const categories = useMemo(() => {
    if (!faqs) return [];
    const set = new Set<string>();
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [faqs]);

  const filtered = useMemo(() => {
    if (!faqs) return [];
    const term = search.trim().toLowerCase();
    return faqs.filter((f) => {
      const matchesCat = activeCategory ? f.category === activeCategory : true;
      const matchesSearch = term
        ? f.question.toLowerCase().includes(term) ||
          f.answer.toLowerCase().includes(term)
        : true;
      return matchesCat && matchesSearch;
    });
  }, [faqs, search, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, Faq[]> = {};
    filtered.forEach((f) => {
      const key = f.category || "General";
      if (!groups[key]) groups[key] = [];
      groups[key].push(f);
    });
    return groups;
  }, [filtered]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-5 md:mb-6 lg:mb-10">
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-[#6F767E] text-lg">
            Quick answers to the questions we hear most often.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6F767E]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="bg-[#1A1D1F] border-[#272B30] text-white placeholder:text-[#6F767E] pl-10 h-11 rounded-xl"
          />
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === null
                  ? "bg-white text-[#111315] border-white"
                  : "bg-[#1A1D1F] text-[#6F767E] border-[#272B30] hover:text-white"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === cat
                    ? "bg-white text-[#111315] border-white"
                    : "bg-[#1A1D1F] text-[#6F767E] border-[#272B30] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-[#272B30] rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6F767E]">No questions found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-white font-semibold text-xl mb-3">{category}</h2>
                <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl px-4">
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        className="border-b border-[#272B30] last:border-b-0"
                      >
                        <AccordionTrigger className="text-white text-left hover:no-underline py-4">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-[#6F767E] leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FAQ;
