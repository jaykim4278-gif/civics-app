import { Link } from "wouter";
import { BookOpen, Calendar, Trophy, ArrowRight, Flag } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { StatsCard } from "@/components/StatsCard";
import { ProgressBar } from "@/components/ProgressBar";
import { useStudyStats } from "@/hooks/use-study";
import { motion } from "framer-motion";

export default function Home() {
  const { data: stats, isLoading } = useStudyStats();

  // Simulated daily goal (could be user setting later)
  const DAILY_GOAL = 10;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const itemsReviewedToday = Math.max(0, DAILY_GOAL - (stats?.dueToday || 0));

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero Section */}
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Good Morning! 🇺🇸
              </h1>
              <p className="text-muted-foreground text-lg">
                Ready to ace your citizenship test?
              </p>
            </div>
            <div className="hidden md:block w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary rotate-3 hover:rotate-6 transition-transform">
              <Flag className="w-8 h-8 fill-current" />
            </div>
          </div>

          <div className="mt-8 bg-white/50 border-2 border-primary/10 rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">Cards Learned</p>
                <p className="text-3xl font-display font-bold text-foreground">{stats?.totalLearned || 0}</p>
              </div>
            </div>
            <div className="h-12 w-px bg-primary/10 mx-4" />
            <div className="flex-1">
              <p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">Due for Review</p>
              <p className="text-3xl font-display font-bold text-primary">{stats?.dueToday || 0}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Main CTA */}
        <section>
          <Link href="/study">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="
                w-full group relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-primary to-primary/80 
                text-white p-8 text-left shadow-lg shadow-primary/25
                border-b-4 border-green-700
                hover:shadow-xl hover:shadow-primary/30 transition-all
              "
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-2 group-hover:translate-x-1 transition-transform">
                    Start Session
                  </h2>
                  <p className="text-primary-foreground/90 font-medium">
                    {stats?.dueToday ? `${stats.dueToday} cards due for review` : "Practice new cards"}
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Decorative circle */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            </motion.button>
          </Link>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard 
            label="Learned" 
            value={stats?.totalLearned || 0} 
            icon={Trophy} 
            color="secondary" 
          />
          <StatsCard 
            label="Due Today" 
            value={stats?.dueToday || 0} 
            icon={Calendar} 
            color="accent" 
          />
        </section>
        
        {/* Quick Links */}
        <section className="pt-4">
          <h3 className="text-lg font-bold text-foreground mb-4 px-2">Library</h3>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <Link href="/questions" className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base">Browse All Questions</h4>
                <p className="text-sm text-muted-foreground">View the complete list of 100 civics questions</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
            </Link>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
