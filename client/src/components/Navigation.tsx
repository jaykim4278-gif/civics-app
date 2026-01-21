import { Link, useLocation } from "wouter";
import { Home, BookOpen, GraduationCap, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/study", icon: GraduationCap, label: "Study" },
    { href: "/questions", icon: BookOpen, label: "Questions" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:static md:border-none md:shadow-none md:bg-transparent">
      <div className="max-w-md mx-auto md:max-w-4xl px-4 h-16 md:h-20 flex items-center justify-between md:justify-start md:gap-8">
        {/* Desktop Logo */}
        <div className="hidden md:flex items-center gap-2 mr-auto">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-display font-bold text-xl">US</span>
          </div>
          <span className="font-display font-bold text-xl text-primary-foreground/90">
            Civics Prep
          </span>
        </div>

        {/* Links */}
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href} className={cn(
              "flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-4 py-2 rounded-xl transition-all duration-200",
              isActive 
                ? "text-primary md:bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>
              <Icon className={cn("w-6 h-6 md:w-5 md:h-5", isActive && "stroke-[2.5px]")} />
              <span className={cn(
                "text-[10px] md:text-sm font-bold uppercase tracking-wide md:normal-case md:tracking-normal",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
