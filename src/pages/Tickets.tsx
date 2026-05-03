import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";

interface Ticket {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug" },
  { value: "feature_request", label: "Feature Request" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const statusStyles: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  resolved: "bg-[#272B30] text-[#9A9FA5] border-[#272B30]",
  closed: "bg-[#272B30] text-[#6F767E] border-[#272B30]",
};

const priorityStyles: Record<string, string> = {
  low: "bg-[#272B30] text-[#9A9FA5] border-[#272B30]",
  normal: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  urgent: "bg-red-500/10 text-red-400 border-red-500/30",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const Tickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["cs-tickets", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_tickets")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Ticket[]) || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not signed in");
      if (!title.trim()) throw new Error("Title is required");

      const { error } = await (supabase as any).from("cs_tickets").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        status: "open",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Request submitted" });
      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("normal");
      queryClient.invalidateQueries({ queryKey: ["cs-tickets", user?.id] });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not submit",
        description: err.message,
      });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-5 md:mb-6 lg:mb-10">
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold mb-3">
            Submit a Request
          </h1>
          <p className="text-[#6F767E] text-lg">
            Tell us what you need. We'll triage and respond fast.
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-6 space-y-5">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of what you need"
              className="bg-[#111315] border-[#272B30] text-white placeholder:text-[#6F767E] h-11 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-[#111315] border-[#272B30] text-white h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D1F] border-[#272B30] text-white">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-[#111315] border-[#272B30] text-white h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D1F] border-[#272B30] text-white">
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give us as much detail as you can: what's happening, what you've tried, screenshots if relevant."
              rows={5}
              className="bg-[#111315] border-[#272B30] text-white placeholder:text-[#6F767E] rounded-xl"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !title.trim()}
              className="bg-white text-[#111315] hover:opacity-90 rounded-full px-6"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit request"
              )}
            </Button>
          </div>
        </div>

        {/* Tickets list */}
        <div>
          <h2 className="text-white font-semibold text-xl mb-4">Your Tickets</h2>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-[#272B30] rounded-xl" />
              ))}
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="text-center py-12 bg-[#1A1D1F] border border-[#272B30] rounded-xl">
              <p className="text-[#6F767E]">No tickets yet.</p>
            </div>
          ) : (
            <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl px-4">
              <Accordion type="single" collapsible className="w-full">
                {tickets.map((t) => {
                  const status = (t.status || "open") as keyof typeof statusStyles;
                  const prio = (t.priority || "normal") as keyof typeof priorityStyles;
                  return (
                    <AccordionItem
                      key={t.id}
                      value={t.id}
                      className="border-b border-[#272B30] last:border-b-0"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 text-left">
                        <div className="flex items-center justify-between gap-4 w-full pr-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium truncate">
                              {t.title}
                            </p>
                            <p className="text-[#6F767E] text-xs mt-1">
                              {formatDate(t.created_at)}
                            </p>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                            {t.category && (
                              <span className="text-[10px] uppercase tracking-wider text-[#9A9FA5] bg-[#272B30] px-2 py-1 rounded-full">
                                {t.category.replace("_", " ")}
                              </span>
                            )}
                            <span
                              className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${priorityStyles[prio]}`}
                            >
                              {prio}
                            </span>
                            <span
                              className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${statusStyles[status]}`}
                            >
                              {status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-[#9A9FA5] leading-relaxed whitespace-pre-line">
                        {t.description || (
                          <span className="text-[#6F767E] italic">
                            No description provided.
                          </span>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tickets;
