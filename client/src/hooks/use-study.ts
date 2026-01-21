import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Types derived from schema
type StudyItem = z.infer<typeof api.study.session.responses[200]>[number];
type StatsResponse = z.infer<typeof api.study.stats.responses[200]>;
type ReviewInput = z.infer<typeof api.study.review.input>;

export function useStudySession() {
  return useQuery({
    queryKey: [api.study.session.path],
    queryFn: async () => {
      const res = await fetch(api.study.session.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch study session");
      // Use schema to parse response
      return api.study.session.responses[200].parse(await res.json());
    },
    // Don't refetch automatically to keep session stable
    staleTime: Infinity, 
    refetchOnWindowFocus: false,
  });
}

export function useStudyStats() {
  return useQuery({
    queryKey: [api.study.stats.path],
    queryFn: async () => {
      const res = await fetch(api.study.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.study.stats.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ReviewInput) => {
      const validated = api.study.review.input.parse(data);
      const res = await fetch(api.study.review.path, {
        method: api.study.review.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to submit review");
      return api.study.review.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate stats to update "Due Today" counts
      queryClient.invalidateQueries({ queryKey: [api.study.stats.path] });
      // Note: We deliberately DO NOT invalidate the session query immediately
      // to prevent the current list of cards from shuffling while the user is studying.
    },
  });
}

// Hook for fetching all questions (reference/list view)
export function useQuestions() {
  return useQuery({
    queryKey: [api.questions.list.path],
    queryFn: async () => {
      const res = await fetch(api.questions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch questions");
      return api.questions.list.responses[200].parse(await res.json());
    },
  });
}
