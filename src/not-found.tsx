import { NightCanvas } from "@/components/NightCanvas";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center pb-24">
      <NightCanvas scene="home" />
      
      <div className="text-center z-10 px-4 bg-background/50 backdrop-blur-sm p-12 rounded-xl border border-border shadow-xl">
        <div className="inline-flex items-center justify-center p-4 mb-6 rounded-full bg-destructive/10 border border-destructive/20 shadow-[0_0_15px_rgba(192,57,43,0.3)]">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        
        <h1 className="text-6xl font-serif font-bold text-foreground mb-4 drop-shadow-md">404</h1>
        <h2 className="text-2xl font-medium text-accent mb-8">This street doesn't exist</h2>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link href="/" asChild>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 shadow-[0_0_15px_rgba(245,166,35,0.3)] transition-all hover:scale-105">
            Return to SafeStreet
          </Button>
        </Link>
      </div>
    </div>
  );
}