import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, Search, Volume2, BookA } from "lucide-react";
import { useQuestions } from "@/hooks/use-study";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";

type VocabItem = {
    word: string;
    meaning: string;
};

export default function Vocabulary() {
    const { data: questions, isLoading } = useQuestions();
    const [search, setSearch] = useState("");

    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    // Extract and dedup vocabulary from all questions
    const allVocab = useMemo(() => {
        if (!questions) return [];

        const vocabMap = new Map<string, string>();

        questions.forEach(q => {
            if (q.vocabulary) {
                try {
                    const words = JSON.parse(q.vocabulary) as VocabItem[];
                    words.forEach(w => {
                        // Store unique words (case-insensitive key, but preserve original casing for display if needed)
                        // Here assuming standard capitalization in dictionary is fine
                        if (!vocabMap.has(w.word)) {
                            vocabMap.set(w.word, w.meaning);
                        }
                    });
                } catch (e) {
                    // ignore parse errors
                }
            }
        });

        return Array.from(vocabMap.entries())
            .map(([word, meaning]) => ({ word, meaning }))
            .sort((a, b) => a.word.localeCompare(b.word));
    }, [questions]);

    const filteredVocab = allVocab.filter(v =>
        v.word.toLowerCase().includes(search.toLowerCase()) ||
        v.meaning.includes(search)
    );

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
                        <h1 className="text-2xl font-display font-bold">Vocabulary List</h1>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search words or meanings..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-muted/50 border-2 border-transparent rounded-2xl focus:border-primary/50 focus:bg-white focus:outline-none transition-all placeholder:text-muted-foreground font-medium"
                        />
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
                        {filteredVocab.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No vocabulary words found.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredVocab.map((item, i) => (
                                <div
                                    key={i}
                                    className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                            <BookA className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground">{item.word}</h3>
                                            <p className="text-muted-foreground font-medium">{item.meaning}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => speak(item.word)}
                                        className="p-2 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
                                        title="Listen"
                                    >
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Navigation />
        </div>
    );
}
