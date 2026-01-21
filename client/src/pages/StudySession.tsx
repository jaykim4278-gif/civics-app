import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useStudySession, useSubmitReview } from "@/hooks/use-study";
import { Flashcard } from "@/components/Flashcard";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";

export default function StudySession() {
  const [, setLocation] = useLocation();
  const { data: sessionItems, isLoading, error } = useStudySession();
  const { mutate: submitReview, isPending: isSubmitting } = useSubmitReview();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // If we finish all cards, redirect or show success
  const isFinished = sessionItems && currentIndex >= sessionItems.length;

  const handleResult = (quality: number) => {
    if (!sessionItems) return;
    
    const currentItem = sessionItems[currentIndex];
    
    submitReview({
      questionId: currentItem.id,
      quality,
    }, {
      onSuccess: () => {
        // Wait a tiny bit for UI feedback then next card
        setTimeout(() => {
          setCompletedCount(prev => prev + 1);
          setCurrentIndex(prev => prev + 1);
        }, 200);
      }
    });
  };

  const handleQuit = () => {
    if (window.confirm("Are you sure you want to quit this session?")) {
      setLocation("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading your cards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">We couldn't load your study session. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Session Complete State
  if (isFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border-2 border-primary/10"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-primary mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            You reviewed {completedCount} cards today. Great job keeping up with your daily goals.
          </p>
          <Button 
            className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            onClick={() => setLocation("/")}
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!sessionItems || sessionItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-primary mb-2">All Caught Up!</h2>
          <p className="text-muted-foreground mb-6">You have no cards due for review right now.</p>
          <Button onClick={() => setLocation("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const currentCard = sessionItems[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="px-4 py-4 md:py-6 flex items-center gap-4 max-w-4xl mx-auto w-full z-10">
        <button 
          onClick={handleQuit}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <ProgressBar 
          current={currentIndex + 1} 
          total={sessionItems.length} 
          className="flex-1"
        />
      </header>

      {/* Main Card Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <Flashcard
              question={currentCard.question}
              answer={currentCard.answer}
              translation={currentCard.translation}
              onResult={handleResult}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-x-1/2" />
      </div>
    </div>
  );
}
