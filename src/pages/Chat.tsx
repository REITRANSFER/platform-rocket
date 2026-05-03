import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Mail, Phone } from "lucide-react";

interface Settings {
  id: string;
  calendly_url: string | null;
  support_email: string | null;
  support_phone: string | null;
  crisp_website_id: string | null;
}

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

const Chat = () => {
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

  useEffect(() => {
    if (!settings?.crisp_website_id) return;

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = settings.crisp_website_id;

    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(script);
      } catch {
        // already removed
      }
      // Remove the injected widget if it mounted
      document.querySelectorAll(".crisp-client").forEach((el) => el.remove());
      delete window.$crisp;
      delete window.CRISP_WEBSITE_ID;
    };
  }, [settings?.crisp_website_id]);

  const supportEmail = settings?.support_email || "support@reitransfer.com";
  const supportPhone = settings?.support_phone;
  const crispActive = Boolean(settings?.crisp_website_id);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-5 md:mb-6 lg:mb-10">
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold mb-3">
            Get Support
          </h1>
          <p className="text-[#6F767E] text-lg">
            We're here to help. Pick the channel that works best for you.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full bg-[#272B30] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live Chat */}
            <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6 flex flex-col">
              <div className="w-11 h-11 rounded-full bg-[#272B30] flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Live Chat</h3>
              <p className="text-[#6F767E] text-sm mb-4 flex-1">
                {crispActive
                  ? "Tap the chat bubble in the corner to start a conversation."
                  : "Live chat is launching soon. Use email or phone in the meantime."}
              </p>
              <span
                className={`inline-flex items-center gap-2 text-xs font-medium ${
                  crispActive ? "text-emerald-400" : "text-[#6F767E]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    crispActive ? "bg-emerald-500" : "bg-[#6F767E]"
                  }`}
                />
                {crispActive ? "Online" : "Coming soon"}
              </span>
            </div>

            {/* Email */}
            <a
              href={`mailto:${supportEmail}`}
              className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6 flex flex-col hover:border-[#3a4046] transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-[#272B30] flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Email</h3>
              <p className="text-[#6F767E] text-sm mb-4 flex-1">
                Best for detailed questions or anything that needs a paper trail.
              </p>
              <span className="text-white text-sm font-medium break-all">
                {supportEmail}
              </span>
            </a>

            {/* Phone */}
            {supportPhone ? (
              <a
                href={`tel:${supportPhone}`}
                className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6 flex flex-col hover:border-[#3a4046] transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[#272B30] flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">Phone</h3>
                <p className="text-[#6F767E] text-sm mb-4 flex-1">
                  For urgent issues. We answer Monday through Friday, 9-5 ET.
                </p>
                <span className="text-white text-sm font-medium">
                  {supportPhone}
                </span>
              </a>
            ) : (
              <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6 flex flex-col">
                <div className="w-11 h-11 rounded-full bg-[#272B30] flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">Phone</h3>
                <p className="text-[#6F767E] text-sm mb-4 flex-1">
                  Phone support is coming soon.
                </p>
                <span className="text-[#6F767E] text-sm font-medium">
                  Coming soon
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Chat;
