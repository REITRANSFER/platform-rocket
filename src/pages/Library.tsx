import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Clock } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string | null;
  order_index: number | null;
  description: string | null;
  reading_time_minutes: number | null;
  hero_emoji: string | null;
}

const Library = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: resources, isLoading } = useQuery({
    queryKey: ["cs-library-resources"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_library_resources")
        .select("id,title,slug,category,subcategory,order_index,description,reading_time_minutes,hero_emoji")
        .order("category", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) throw error;
      return (data as Resource[]) || [];
    },
  });

  const categories = useMemo(() => {
    if (!resources) return [];
    const set = new Set<string>();
    resources.forEach((r) => set.add(r.category));
    return Array.from(set);
  }, [resources]);

  const filtered = useMemo(() => {
    if (!resources) return [];
    const term = search.trim().toLowerCase();
    return resources.filter((r) => {
      const matchesCat = activeCategory ? r.category === activeCategory : true;
      const matchesSearch = term
        ? r.title.toLowerCase().includes(term) ||
          (r.description || "").toLowerCase().includes(term)
        : true;
      return matchesCat && matchesSearch;
    });
  }, [resources, search, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, Resource[]> = {};
    filtered.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [filtered]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-5 md:mb-6 lg:mb-10">
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold mb-3">
            Library
          </h1>
          <p className="text-[#6F767E] text-lg">
            Frameworks, SOPs, and operator guides to sharpen your business.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6F767E]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full bg-[#272B30] rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6F767E]">No resources found.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-white font-semibold text-xl mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((resource) => (
                    <NavLink
                      key={resource.id}
                      to={`/library/${resource.slug}`}
                      className="group bg-[#1A1D1F] border border-[#272B30] rounded-xl p-5 hover:border-[#3F4549] transition-colors flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{resource.hero_emoji || "📘"}</div>
                        {resource.reading_time_minutes ? (
                          <div className="flex items-center gap-1 text-[#6F767E] text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{resource.reading_time_minutes} min</span>
                          </div>
                        ) : null}
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="text-[#6F767E] text-sm leading-relaxed mb-4 flex-1">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-white text-sm font-medium group-hover:gap-2 transition-all">
                        Read
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Library;
