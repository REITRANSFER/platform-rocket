import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Clock } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  duration?: string;
}

const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/templates": "Templates",
    "/training": "Training",
    "/library": "Library",
    "/onboarding": "Onboarding",
    "/faq": "FAQ",
    "/glossary": "Glossary",
    "/schedule": "Schedule",
    "/chat": "Chat",
    "/team": "Team",
    "/tickets": "Submit Request",
    "/changelog": "Updates",
    "/premium": "Premium",
  };
  if (pathname.startsWith("/library/")) return "Library";
  if (pathname.startsWith("/lesson/")) return "Lesson";
  return routes[pathname] || "Dashboard";
};

export function DashboardLayout({ children, title, subtitle, duration }: DashboardLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const pageTitle = title || getPageTitle(location.pathname);

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[hsl(var(--platform-background))] overflow-x-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
          {/* Simple Header - page title + avatar */}
          <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-[#1A2330]/50">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="text-white/60 hover:text-white hover:bg-transparent shrink-0">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-white truncate">{pageTitle}</h1>
                {subtitle && (
                  <p className="text-sm text-white/60 truncate">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {duration && (
                <div className="hidden sm:flex items-center gap-2 text-[#6F767E] text-sm bg-[#1A2330] px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>{duration} lesson</span>
                </div>
              )}
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback
                  className="text-white text-xs font-medium"
                  style={{
                    background: '#ed1c24',
                    boxShadow: 'rgba(255, 255, 255, 0.4) 0px -4px 8px inset, rgba(255, 255, 255, 0.8) 0px 0px 4px inset'
                  }}
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
