import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { questions as questionsSchema } from "@shared/schema"; // For typing if needed
import { addDays, addMinutes } from "date-fns";

// SM-2 Algorithm Implementation
function calculateSM2(
  quality: number,
  previousInterval: number,
  previousEaseFactor: number,
  reviewCount: number
) {
  let interval: number;
  let easeFactor: number;

  // Quality: 0-5
  // 0-2: Incorrect response
  // 3-5: Correct response

  if (quality >= 3) {
    if (reviewCount === 0) {
      interval = 1;
    } else if (reviewCount === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * previousEaseFactor);
    }
    
    reviewCount += 1;
  } else {
    reviewCount = 0;
    interval = 1; // Reset to 1 day (or could be minutes for immediate retry)
  }

  // Update Ease Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { interval, easeFactor, reviewCount };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === API Routes ===

  app.get(api.questions.list.path, async (req, res) => {
    const questions = await storage.getQuestions();
    res.json(questions);
  });

  app.post(api.questions.create.path, async (req, res) => {
    const input = api.questions.create.input.parse(req.body);
    const question = await storage.createQuestion(input);
    res.status(201).json(question);
  });

  // Study Session: Get mixed batch of Due + New
  app.get(api.study.session.path, async (req, res) => {
    // 1. Get Due Items
    const dueItems = await storage.getDueQuestions(100); 
    
    // 2. Get New Items (Show up to 100 new questions if available)
    const newItems = await storage.getNewQuestions(100);

    const session = [
      ...dueItems.map(item => ({ ...item, isNew: false })),
      ...newItems.map(item => ({ ...item, isNew: true, progress: undefined }))
    ];

    res.json(session);
  });

  // Submit Review
  app.post(api.study.review.path, async (req, res) => {
    const { questionId, quality } = api.study.review.input.parse(req.body);
    
    // Get existing progress or defaults
    const currentProgress = await storage.getUserProgress(questionId);
    
    const previousInterval = currentProgress?.interval ?? 0;
    const previousEaseFactor = currentProgress?.easeFactor ?? 2.5;
    const previousReviewCount = currentProgress?.reviewCount ?? 0;

    // Calculate new SM-2 values
    const { interval, easeFactor, reviewCount } = calculateSM2(
      quality,
      previousInterval,
      previousEaseFactor,
      previousReviewCount
    );

    // Calculate next date
    const nextReviewDate = addDays(new Date(), interval);

    // Update DB
    const updated = await storage.updateUserProgress({
      questionId,
      interval,
      easeFactor,
      reviewCount,
      nextReviewDate
    });

    res.json({
      nextReviewDate: updated.nextReviewDate.toISOString(),
      interval: updated.interval
    });
  });

  app.get(api.study.stats.path, async (req, res) => {
    const stats = await storage.getStudyStats();
    res.json(stats);
  });

  // === Seeding Data ===
  // Seed some US Civics questions if empty
  await seedDatabase();

  return httpServer;
}

// Simple internal helper to generate keywords from text using rules
// In a full autonomous mode, we might use an LLM integration,
// but for Fast mode we'll provide a pre-defined mapping for the sample questions.
function generateKeywords(question: string, answer: string): string {
  const dictionary: Record<string, string> = {
    "supreme": "최고의",
    "law": "법",
    "constitution": "헌법",
    "government": "정부",
    "self-government": "자치 정부",
    "words": "단어들",
    "amendment": "수정안",
    "change": "변화",
    "bill of rights": "권리 장전",
    "right": "권리",
    "freedom": "자유",
    "speech": "언론/연설",
    "independence": "독립",
    "announced": "발표했다",
    "executive branch": "행정부",
    "charge": "책임",
    "president": "대통령",
    "federal": "연방의",
    "congress": "의회"
  };

  const combined = (question + " " + answer).toLowerCase();
  const found: { word: string; definition: string }[] = [];
  
  Object.entries(dictionary).forEach(([word, definition]) => {
    if (combined.includes(word) && found.length < 4) {
      found.push({ word: word.charAt(0).toUpperCase() + word.slice(1), definition });
    }
  });

  return JSON.stringify(found);
}

async function seedDatabase() {
  // Realistic sample of 2008 version US Civics Test questions
  const sampleQuestions = [
    {
      question: "What is the supreme law of the land?",
      answer: "The Constitution",
      translation: "이 땅의 최고 법은 무엇입니까? - 헌법",
      category: "Principles of American Democracy"
    },
    {
      question: "What does the Constitution do?",
      answer: "Sets up the government",
      translation: "헌법은 무슨 역할을 합니까? - 정부를 구성합니다",
      category: "Principles of American Democracy"
    },
    {
      question: "The idea of self-government is in the first three words of the Constitution. What are these words?",
      answer: "We the People",
      translation: "자치 정부의 이념은 헌법의 첫 세 단어에 있습니다. 이 단어들은 무엇입니까? - 우리 국민 (We the People)",
      category: "Principles of American Democracy"
    },
    {
      question: "What is an amendment?",
      answer: "A change (to the Constitution)",
      translation: "수정안(amendment)이란 무엇입니까? - (헌법의) 변화",
      category: "Principles of American Democracy"
    },
    {
      question: "What do we call the first ten amendments to the Constitution?",
      answer: "The Bill of Rights",
      translation: "헌법의 첫 10개 수정안을 무엇이라고 부릅니까? - 권리 장전 (The Bill of Rights)",
      category: "Principles of American Democracy"
    },
    {
      question: "What is one right or freedom from the First Amendment?",
      answer: "Speech",
      translation: "수정헌법 제1조에 있는 하나의 권리 또는 자유는 무엇입니까? - 언론의 자유",
      category: "Principles of American Democracy"
    },
    {
      question: "How many amendments does the Constitution have?",
      answer: "Twenty-seven (27)",
      translation: "헌법에는 몇 개의 수정안이 있습니까? - 27개",
      category: "Principles of American Democracy"
    },
    {
      question: "What did the Declaration of Independence do?",
      answer: "Announced our independence (from Great Britain)",
      translation: "독립 선언서는 무엇을 했습니까? - (영국으로부터의) 독립을 선언함",
      category: "Principles of American Democracy"
    },
    {
      question: "Who is in charge of the executive branch?",
      answer: "The President",
      translation: "행정부의 책임자는 누구입니까? - 대통령",
      category: "System of Government"
    },
    {
      question: "Who makes federal laws?",
      answer: "Congress",
      translation: "연방 법은 누가 만듭니까? - 의회",
      category: "System of Government"
    }
  ].map(q => ({
    ...q,
    keywords: generateKeywords(q.question, q.answer)
  }));

  await storage.seedQuestions(sampleQuestions);
}
