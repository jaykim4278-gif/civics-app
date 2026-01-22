import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCw, ThumbsUp, HelpCircle, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  question: string;
  answer: string;
  translation?: string | null;
  keywords?: string | null;
  vocabulary?: string | null;
  onResult: (quality: number) => void;
  isSubmitting?: boolean;
}

export function Flashcard({
  question,
  answer,
  translation,
  keywords,
  vocabulary,
  onResult,
  isSubmitting = false
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  };

  const parsedKeywords = keywords ? JSON.parse(keywords) as { word: string, definition: string }[] : [];
  const parsedVocabulary = vocabulary ? JSON.parse(vocabulary) as { word: string, meaning: string }[] : [];

  return (
    <div className="w-full max-w-lg mx-auto perspective-1000 min-h-[400px] relative flex flex-col">
      <div className="relative flex-1 cursor-pointer group" onClick={handleFlip}>
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full preserve-3d absolute inset-0 rounded-3xl shadow-xl bg-card border-2 border-border/50 group-hover:border-primary/20 transition-colors"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front of Card */}
          <div className="absolute inset-0 backface-hidden p-8 flex flex-col items-center justify-center text-center bg-white rounded-3xl">
            <div className="absolute top-6 left-6 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <HelpCircle className="w-6 h-6" />
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); speak(question); }}
              className="absolute top-6 right-6 w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-colors"
              title="Listen to question"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight px-4">
              {question}
            </h3>
            <p className="mt-8 text-muted-foreground text-sm font-bold uppercase tracking-wider animate-pulse">
              Tap to flip
            </p>
          </div>

          {/* Back of Card */}
          <div
            className="absolute inset-0 backface-hidden p-8 flex flex-col overflow-y-auto items-center justify-start text-center bg-primary/5 rounded-3xl rotate-y-180"
          >
            <div className="absolute top-6 left-6 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 shrink-0">
              <Check className="w-6 h-6 stroke-[3px]" />
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); speak(answer); }}
              className="absolute top-6 right-6 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
              title="Listen to answer"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <div className="mt-16 w-full flex flex-col items-center">
              <p className="text-xl md:text-2xl font-bold text-foreground/90 mb-4 px-4">
                {answer}
              </p>

              {translation && (
                <div className="mt-4 pb-4 border-b border-primary/10 w-full px-8">
                  <p className="text-lg text-muted-foreground italic font-medium">
                    {translation}
                  </p>
                </div>
              )}

              {parsedVocabulary.length > 0 && (
                <div className="mt-6 w-full px-8 pb-8">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary/60 mb-3 flex items-center justify-center gap-2">
                    <span className="w-4 h-px bg-primary/20"></span>
                    📝 Key Vocabulary
                    <span className="w-4 h-px bg-primary/20"></span>
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {parsedVocabulary.map((word, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-white border border-primary/10 rounded-full py-1.5 pl-4 pr-2 shadow-sm"
                      >
                        <span className="font-bold text-sm text-foreground">{word.word}</span>
                        <span className="text-muted-foreground text-xs">{word.meaning}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); speak(word.word); }}
                          className="w-6 h-6 rounded-full hover:bg-primary/10 flex items-center justify-center text-primary/60 hover:text-primary transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons - Only visible when flipped */}
      <div className="mt-8 h-24">
        <AnimatePresence mode="wait">
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="grid grid-cols-3 gap-3 md:gap-4"
            >
              <button
                disabled={isSubmitting}
                onClick={(e) => { e.stopPropagation(); onResult(1); }}
                className="
                  flex flex-col items-center justify-center p-3 rounded-2xl
                  bg-destructive/10 text-destructive border-2 border-destructive/20
                  hover:bg-destructive hover:text-white hover:border-destructive
                  active:scale-95 transition-all duration-200
                "
              >
                <X className="w-6 h-6 mb-1" />
                <span className="font-bold text-xs uppercase">Hard</span>
              </button>

              <button
                disabled={isSubmitting}
                onClick={(e) => { e.stopPropagation(); onResult(3); }}
                className="
                  flex flex-col items-center justify-center p-3 rounded-2xl
                  bg-secondary/10 text-secondary border-2 border-secondary/20
                  hover:bg-secondary hover:text-white hover:border-secondary
                  active:scale-95 transition-all duration-200
                "
              >
                <RotateCw className="w-6 h-6 mb-1" />
                <span className="font-bold text-xs uppercase">Good</span>
              </button>

              <button
                disabled={isSubmitting}
                onClick={(e) => { e.stopPropagation(); onResult(5); }}
                className="
                  flex flex-col items-center justify-center p-3 rounded-2xl
                  bg-primary/10 text-primary border-2 border-primary/20
                  hover:bg-primary hover:text-white hover:border-primary
                  active:scale-95 transition-all duration-200
                "
              >
                <ThumbsUp className="w-6 h-6 mb-1" />
                <span className="font-bold text-xs uppercase">Easy</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
