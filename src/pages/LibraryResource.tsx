import { useQuery } from "@tanstack/react-query";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string | null;
  order_index: number | null;
  description: string | null;
  body: string;
  reading_time_minutes: number | null;
  hero_emoji: string | null;
}

const LibraryResource = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: resource, isLoading } = useQuery({
    queryKey: ["cs-library-resource", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_library_resources")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as Resource | null;
    },
  });

  const { data: siblings } = useQuery({
    queryKey: ["cs-library-siblings", resource?.category],
    enabled: !!resource?.category,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cs_library_resources")
        .select("id,title,slug,order_index")
        .eq("category", resource!.category)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return (data as Pick<Resource, "id" | "title" | "slug" | "order_index">[]) || [];
    },
  });

  const currentIndex = siblings && resource
    ? siblings.findIndex((s) => s.id === resource.id)
    : -1;
  const prevSibling = currentIndex > 0 ? siblings?.[currentIndex - 1] : undefined;
  const nextSibling =
    siblings && currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : undefined;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-6 w-32 bg-[#272B30]" />
          <Skeleton className="h-12 w-3/4 bg-[#272B30]" />
          <Skeleton className="h-96 w-full bg-[#272B30] rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!resource) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-[#6F767E] text-lg mb-4">Resource not found.</p>
          <button
            onClick={() => navigate("/library")}
            className="text-white underline"
          >
            Back to Library
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back link */}
        <NavLink
          to="/library"
          className="inline-flex items-center gap-2 text-[#6F767E] hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </NavLink>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-[#6F767E]">
            <span className="px-3 py-1 bg-[#1A1D1F] border border-[#272B30] rounded-full">
              {resource.category}
            </span>
            {resource.reading_time_minutes ? (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{resource.reading_time_minutes} min read</span>
              </div>
            ) : null}
          </div>
          {resource.hero_emoji && (
            <div className="text-5xl">{resource.hero_emoji}</div>
          )}
          <h1 className="gradient-text text-3xl md:text-4xl font-semibold leading-tight">
            {resource.title}
          </h1>
          {resource.description && (
            <p className="text-[#6F767E] text-lg leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>

        {/* Body */}
        <article className="prose prose-invert prose-lg max-w-none
          prose-headings:text-white prose-headings:font-semibold
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-[#B6BBC0] prose-p:leading-relaxed
          prose-a:text-white prose-a:underline
          prose-strong:text-white
          prose-li:text-[#B6BBC0] prose-li:leading-relaxed
          prose-blockquote:border-l-2 prose-blockquote:border-[#3F4549] prose-blockquote:text-[#6F767E] prose-blockquote:not-italic
          prose-code:text-white prose-code:bg-[#1A1D1F] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-hr:border-[#272B30]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {resource.body}
          </ReactMarkdown>
        </article>

        {/* Curriculum nav */}
        {(prevSibling || nextSibling) && (
          <div className="border-t border-[#272B30] pt-6 grid grid-cols-2 gap-4">
            {prevSibling ? (
              <NavLink
                to={`/library/${prevSibling.slug}`}
                className="group bg-[#1A1D1F] border border-[#272B30] rounded-xl p-4 hover:border-[#3F4549] transition-colors"
              >
                <div className="flex items-center gap-2 text-[#6F767E] text-xs mb-1">
                  <ArrowLeft className="h-3 w-3" />
                  Previous
                </div>
                <div className="text-white text-sm font-medium">{prevSibling.title}</div>
              </NavLink>
            ) : (
              <div />
            )}
            {nextSibling ? (
              <NavLink
                to={`/library/${nextSibling.slug}`}
                className="group bg-[#1A1D1F] border border-[#272B30] rounded-xl p-4 hover:border-[#3F4549] transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-2 text-[#6F767E] text-xs mb-1">
                  Next
                  <ArrowRight className="h-3 w-3" />
                </div>
                <div className="text-white text-sm font-medium">{nextSibling.title}</div>
              </NavLink>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LibraryResource;
