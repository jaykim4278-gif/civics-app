import { db } from "./db";
import {
  questions,
  userProgress,
  type Question,
  type InsertQuestion,
  type UserProgress,
  type InsertUserProgress,
} from "@shared/schema";
import { eq, and, lt, isNull, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Questions
  getQuestions(): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  seedQuestions(questions: InsertQuestion[]): Promise<void>;

  // Progress / Study Logic
  getUserProgress(questionId: number): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Advanced Queries for Session
  getDueQuestions(limit?: number): Promise<(Question & { progress: UserProgress })[]>;
  getNewQuestions(limit?: number): Promise<Question[]>;
  getStudyStats(): Promise<{ totalLearned: number; dueToday: number; newTodayRemaining: number }>;
}

export class DatabaseStorage implements IStorage {
  async getQuestions(): Promise<Question[]> {
    return await db.select().from(questions);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async seedQuestions(qs: InsertQuestion[]): Promise<void> {
    const count = await db.select({ count: sql<number>`count(*)` }).from(questions);
    if (Number(count[0].count) === 0) {
      await db.insert(questions).values(qs);
    }
  }

  async getUserProgress(questionId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.questionId, questionId));
    return progress;
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    // Upsert logic (PostgreSQL specific usually, but here handled via check)
    const existing = await this.getUserProgress(progress.questionId);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          ...progress,
          lastReviewedAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          ...progress,
          lastReviewedAt: new Date(),
        })
        .returning();
      return created;
    }
  }

  async getDueQuestions(limit = 20): Promise<(Question & { progress: UserProgress })[]> {
    const now = new Date();
    // Join questions with userProgress where nextReviewDate <= now
    const results = await db
      .select()
      .from(questions)
      .innerJoin(userProgress, eq(questions.id, userProgress.questionId))
      .where(lt(userProgress.nextReviewDate, now))
      .orderBy(asc(userProgress.nextReviewDate))
      .limit(limit);

    return results.map(r => ({ ...r.questions, progress: r.user_progress }));
  }

  async getNewQuestions(limit = 3): Promise<Question[]> {
    // Find questions that DO NOT have a userProgress entry
    // Drizzle doesn't have a simple "NOT IN" or "LEFT JOIN ... IS NULL" builder that is super concise,
    // so we'll do a left join and filter for null right side.
    
    const results = await db
      .select({
        question: questions,
        progressId: userProgress.id
      })
      .from(questions)
      .leftJoin(userProgress, eq(questions.id, userProgress.questionId))
      .where(isNull(userProgress.id))
      .limit(limit);

    return results.map(r => r.question);
  }

  async getStudyStats() {
    // Count learned items (where progress exists)
    const [learned] = await db.select({ count: sql<number>`count(*)` }).from(userProgress);
    
    // Count due items
    const now = new Date();
    const [due] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(lt(userProgress.nextReviewDate, now));

    // For "New Today", we'd typically track how many new items were *started* today.
    const [availableNew] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .leftJoin(userProgress, eq(questions.id, userProgress.questionId))
      .where(isNull(userProgress.id));

    return {
      totalLearned: Number(learned.count),
      dueToday: Number(due.count),
      newTodayRemaining: Number(availableNew.count) // Show all available new questions
    };
  }
}

export const storage = new DatabaseStorage();
