import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Search, Filter, Volume2 } from "lucide-react";
import { useQuestions } from "@/hooks/use-study";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";

export default function QuestionsList() {
  const { data: questions, isLoading } = useQuestions();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const filteredQuestions = questions?.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase()) || 
                          q.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? q.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(questions?.map(q => q.category) || [])).filter(Boolean);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-bold">All Questions</h1>
          </div>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions or answers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted/50 border-2 border-transparent rounded-2xl focus:border-primary/50 focus:bg-white focus:outline-none transition-all placeholder:text-muted-foreground font-medium"
              />
            </div>

            {/* Category Filter Pills */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                    selectedCategory === null 
                      ? "bg-foreground text-background" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors capitalize",
                      selectedCategory === cat 
                        ? "bg-primary text-white" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* List */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No questions found matching your search.</p>
              </div>
            )}
            
            {filteredQuestions?.map((q, i) => (
              <div 
                key={q.id} 
                className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start gap-4 mb-2">
                  <span className="inline-block px-2 py-1 bg-muted rounded-md text-xs font-bold uppercase text-muted-foreground">
                    #{q.id}
                  </span>
                  {q.category && (
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">
                      {q.category}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="text-lg font-bold text-foreground leading-snug">
                    {q.question}
                  </h3>
                  <button
                    onClick={() => speak(q.question)}
                    className="p-2 bg-secondary/10 rounded-full text-secondary hover:bg-secondary hover:text-white transition-colors shrink-0"
                    title="Speak question"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-start gap-4 pl-4 border-l-4 border-primary/20">
                  <div className="flex-1">
                    <p className="text-muted-foreground font-medium">
                      {q.answer}
                    </p>
                    {q.translation && (
                      <p className="mt-1 text-sm text-muted-foreground/70 italic mb-2">
                        {q.translation}
                      </p>
                    )}
                    {q.keywords && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(JSON.parse(q.keywords) as {word: string, definition: string}[]).map((kw, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full text-[10px] font-bold text-primary/70 border border-primary/10">
                            {kw.word}: {kw.definition}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => speak(q.answer)}
                    className="p-1.5 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
                    title="Speak answer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
