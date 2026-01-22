import { z } from 'zod';
import { questions, userProgress, insertQuestionSchema } from './schema.js';

export const api = {
  questions: {
    list: {
      method: 'GET' as const,
      path: '/api/questions',
      responses: {
        200: z.array(z.custom<typeof questions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/questions',
      input: insertQuestionSchema,
      responses: {
        201: z.custom<typeof questions.$inferSelect>(),
      },
    },
  },
  study: {
    session: {
      method: 'GET' as const,
      path: '/api/study/session',
      responses: {
        200: z.array(z.custom<typeof questions.$inferSelect & { isNew: boolean, progress?: typeof userProgress.$inferSelect }>()),
      },
    },
    review: {
      method: 'POST' as const,
      path: '/api/study/review',
      input: z.object({
        questionId: z.number(),
        quality: z.number().min(0).max(5), // 0=blackout, 5=perfect
      }),
      responses: {
        200: z.object({
          nextReviewDate: z.string(),
          interval: z.number(),
        }),
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/study/stats',
      responses: {
        200: z.object({
          totalLearned: z.number(),
          dueToday: z.number(),
          newTodayRemaining: z.number(),
        }),
      },
    },
  },
};

// Helper for URL building
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
