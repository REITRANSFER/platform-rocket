import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, CalendarClock } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  calendar_url: string | null;
  order_index: number | null;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Team = () => {
  const { data: team, isLoading } = useQuery({
    queryKey: ["cs-team"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_team")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return (data as TeamMember[]) || [];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-5 md:mb-6 lg:mb-10">
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold mb-3">
            Meet the Team
          </h1>
          <p className="text-[#6F767E] text-lg">
            The people behind your account. Reach out anytime.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6 space-y-4"
              >
                <Skeleton className="h-20 w-20 rounded-full bg-[#272B30]" />
                <Skeleton className="h-5 w-2/3 bg-[#272B30]" />
                <Skeleton className="h-4 w-full bg-[#272B30]" />
                <Skeleton className="h-4 w-5/6 bg-[#272B30]" />
              </div>
            ))}
          </div>
        ) : !team || team.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6F767E]">No team members listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((m) => (
              <div
                key={m.id}
                className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6 flex flex-col"
              >
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={m.photo_url || undefined} alt={m.name} />
                  <AvatarFallback
                    className="text-white text-lg font-medium"
                    style={{
                      background:
                        "linear-gradient(90deg, rgb(158, 103, 250), rgb(254, 106, 187) 45%, rgb(255, 156, 101))",
                    }}
                  >
                    {getInitials(m.name)}
                  </AvatarFallback>
                </Avatar>

                <h3 className="text-white font-semibold text-lg">{m.name}</h3>
                {m.role && (
                  <p className="text-[#6F767E] text-sm mb-3">{m.role}</p>
                )}
                {m.bio && (
                  <p className="text-[#9A9FA5] text-sm leading-relaxed mb-5 flex-1">
                    {m.bio}
                  </p>
                )}

                <div className="flex flex-col gap-2 mt-auto">
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="inline-flex items-center gap-2 text-sm text-white hover:text-[#9E67FA] transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {m.email}
                    </a>
                  )}
                  {m.calendar_url && (
                    <a
                      href={m.calendar_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white text-[#111315] font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      <CalendarClock className="w-4 h-4" />
                      Book a call
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Team;
