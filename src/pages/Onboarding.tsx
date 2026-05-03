import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface OnboardingTask {
  id: string;
  title: string;
  description: string | null;
  day_range: string | null;
  order_index: number | null;
}

interface UserOnboarding {
  id: string;
  user_id: string;
  task_id: string;
  completed: boolean;
}

const Onboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["cs-onboarding-tasks"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_onboarding_tasks")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return (data as OnboardingTask[]) || [];
    },
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["cs-user-onboarding", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_user_onboarding")
        .select("*")
        .eq("user_id", user!.id);

      if (error) throw error;
      return (data as UserOnboarding[]) || [];
    },
  });

  const completedSet = useMemo(() => {
    const set = new Set<string>();
    (progress || []).forEach((p) => {
      if (p.completed) set.add(p.task_id);
    });
    return set;
  }, [progress]);

  const grouped = useMemo(() => {
    const groups: Record<string, OnboardingTask[]> = {};
    (tasks || []).forEach((t) => {
      const key = t.day_range || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [tasks]);

  const totalCount = tasks?.length || 0;
  const doneCount = completedSet.size;
  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const toggleMutation = useMutation({
    mutationFn: async ({
      taskId,
      completed,
    }: {
      taskId: string;
      completed: boolean;
    }) => {
      if (!user?.id) throw new Error("Not signed in");
      const payload = {
        user_id: user.id,
        task_id: taskId,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      };
      const { error } = await (supabase as any)
        .from("cs_user_onboarding")
        .upsert(payload, { onConflict: "user_id,task_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cs-user-onboarding", user?.id] });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not save",
        description: err.message,
      });
    },
  });

  const isLoading = tasksLoading || progressLoading;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-5 md:mb-6 lg:mb-10">
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold mb-3">
            Your First 30 Days
          </h1>
          <p className="text-[#6F767E] text-lg">
            A simple checklist to get you set up and seeing results fast.
          </p>
        </div>

        {/* Progress */}
        {!isLoading && totalCount > 0 && (
          <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">
                {doneCount} of {totalCount} complete
              </span>
              <span className="text-[#6F767E] text-sm">{percent}%</span>
            </div>
            <Progress value={percent} className="h-2 bg-[#272B30]" />
          </div>
        )}

        {/* Tasks */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-[#272B30] rounded-xl" />
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6F767E]">No onboarding tasks yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([day, items]) => (
              <div key={day}>
                <h2 className="text-white font-semibold text-xl mb-4">{day}</h2>
                <div className="bg-[#1A1D1F] border border-[#272B30] rounded-xl divide-y divide-[#272B30]">
                  {items.map((task) => {
                    const isDone = completedSet.has(task.id);
                    return (
                      <label
                        key={task.id}
                        htmlFor={`task-${task.id}`}
                        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-[#1f2225] transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={isDone}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({
                              taskId: task.id,
                              completed: Boolean(checked),
                            })
                          }
                          className="mt-1 border-[#272B30] data-[state=checked]:bg-[#9E67FA] data-[state=checked]:border-[#9E67FA]"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium ${
                              isDone
                                ? "text-[#6F767E] line-through"
                                : "text-white"
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[#6F767E] text-sm mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Onboarding;
