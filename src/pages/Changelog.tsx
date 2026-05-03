import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ChangelogEntry {
  id: string;
  title: string;
  body: string | null;
  entry_type: string | null;
  published_at: string;
}

const typeStyles: Record<string, string> = {
  update: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  fix: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  new: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  announcement: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const Changelog = () => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["cs-changelog"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_changelog")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return (data as ChangelogEntry[]) || [];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-5 md:mb-6 lg:mb-10">
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold mb-3">
            Updates
          </h1>
          <p className="text-[#6F767E] text-lg">
            What we're shipping. Newest first.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-[#272B30] rounded-xl" />
            ))}
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6F767E]">No updates yet.</p>
          </div>
        ) : (
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-2 top-2 bottom-2 w-px bg-[#272B30] hidden md:block" />

            {entries.map((entry) => {
              const type = (entry.entry_type || "update") as keyof typeof typeStyles;
              return (
                <div key={entry.id} className="relative md:pl-10">
                  {/* Dot */}
                  <span className="absolute left-0 top-6 hidden md:block">
                    <span className="block w-4 h-4 rounded-full bg-[#1A1D1F] border-2 border-[#9E67FA]" />
                  </span>

                  <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border font-medium ${
                          typeStyles[type] || typeStyles.update
                        }`}
                      >
                        {type}
                      </span>
                      <span className="text-[#6F767E] text-sm">
                        {formatDate(entry.published_at)}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {entry.title}
                    </h3>
                    {entry.body && (
                      <p className="text-[#9A9FA5] leading-relaxed whitespace-pre-line">
                        {entry.body}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Changelog;
