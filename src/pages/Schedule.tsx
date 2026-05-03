import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, Mail } from "lucide-react";

interface Settings {
  id: string;
  calendly_url: string | null;
  support_email: string | null;
  support_phone: string | null;
  crisp_website_id: string | null;
}

const Schedule = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["cs-settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (error) throw error;
      return data as Settings | null;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-5 md:mb-6 lg:mb-10">
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold mb-3">
            Schedule a Call
          </h1>
          <p className="text-[#6F767E] text-lg">
            Book a 1:1 strategy session with our team. We'll review your goals,
            walk through the next steps, and answer any questions.
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-[700px] w-full bg-[#272B30] rounded-xl" />
        ) : settings?.calendly_url ? (
          <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl overflow-hidden">
            <iframe
              src={settings.calendly_url}
              width="100%"
              height="700"
              frameBorder="0"
              title="Schedule a Call"
              className="block"
            />
          </div>
        ) : (
          <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-10 text-center">
            <CalendarClock className="w-12 h-12 text-[#6F767E] mx-auto mb-4" />
            <h2 className="text-white font-semibold text-xl mb-2">
              Booking is coming soon
            </h2>
            <p className="text-[#6F767E] mb-6 max-w-md mx-auto">
              Our calendar isn't live yet. In the meantime, send us a note and
              we'll reach out to schedule.
            </p>
            <a
              href={`mailto:${settings?.support_email || "support@reitransfer.com"}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#111315] font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Mail className="w-4 h-4" />
              {settings?.support_email || "support@reitransfer.com"}
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
