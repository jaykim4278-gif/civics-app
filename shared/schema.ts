import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  translation: text("translation"), // Optional translation
  category: text("category").default("general"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id),
  // SM-2 Algorithm Fields
  interval: integer("interval").notNull().default(0), // Days until next review
  easeFactor: real("ease_factor").notNull().default(2.5), // Multiplier
  reviewCount: integer("review_count").notNull().default(0), // Number of times reviewed
  nextReviewDate: timestamp("next_review_date").notNull().defaultNow(),
  lastReviewedAt: timestamp("last_reviewed_at"),
});

// Schemas
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });

// Types
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

// API Types
export type StudyItem = Question & {
  progress?: UserProgress; // Attached if it exists
  isNew: boolean;
};

export type ReviewSubmission = {
  questionId: number;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0-5 rating (usually mapped to button choices like Hard=1, Good=3, Easy=5)
};

export type StudyStats = {
  totalLearned: number;
  dueToday: number;
  newToday: number;
};
