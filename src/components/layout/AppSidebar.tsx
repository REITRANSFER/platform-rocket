import {
  Home,
  GraduationCap,
  LayoutGrid,
  LogOut,
  ChevronRight,
  ListChecks,
  HelpCircle,
  BookOpen,
  CalendarClock,
  MessageSquare,
  Ticket,
  Megaphone,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";

const mainNavItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Onboarding", url: "/onboarding", icon: ListChecks },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Templates", url: "/templates", icon: LayoutGrid },
];

const supportNavItems = [
  { title: "FAQ", url: "/faq", icon: HelpCircle },
  { title: "Glossary", url: "/glossary", icon: BookOpen },
  { title: "Schedule a Call", url: "/schedule", icon: CalendarClock },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Submit Request", url: "/tickets", icon: Ticket },
  { title: "Updates", url: "/changelog", icon: Megaphone },
  { title: "Meet the Team", url: "/team", icon: Users },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const renderNavItem = (item: { title: string; url: string; icon: typeof Home }) => {
    const isActive = location.pathname === item.url;
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.title}
          className="h-10 px-3 rounded-full hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
        >
          <NavLink to={item.url} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-semibold">{item.title}</span>
            </div>
            {isActive && <ChevronRight className="h-4 w-4" />}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="p-5 pb-2">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={logo} alt="Sasifye" className="h-8 w-auto" />
        </NavLink>
      </SidebarHeader>

      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback
              className="text-white text-sm font-medium"
              style={{
                background:
                  "linear-gradient(90deg, rgb(158, 103, 250), rgb(254, 106, 187) 45%, rgb(255, 156, 101))",
                boxShadow:
                  "rgba(255, 255, 255, 0.4) 0px -4px 8px inset, rgba(255, 255, 255, 0.8) 0px 0px 4px inset",
              }}
            >
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-white" style={{ fontSize: "15.4px" }}>
              {userName}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-white" style={{ fontSize: "13.2px" }}>
                Free Plan
              </span>
            </div>
          </div>
        </div>
      </div>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{mainNavItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pt-2 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{supportNavItems.map(renderNavItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="h-10 px-3 hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-semibold">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
