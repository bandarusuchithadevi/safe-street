import { useListReports, useRateAuthority } from "@workspace/api-client-react";
import { NightCanvas } from "@/components/NightCanvas";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Resolved() {
  const { data: reports, isLoading } = useListReports({ status: "resolved", limit: 30 });

  return (
    <div className="relative min-h-screen pb-24">
      <NightCanvas scene="dawn" />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4 text-shadow-sm">Problems Solved</h1>
          <p className="text-accent text-lg">Civic action works. These hazards have been permanently fixed by assigned authorities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-72 w-full bg-card/50 rounded-xl" />)
          ) : reports?.map(report => (
            <ResolvedCard key={report.id} report={report} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResolvedCard({ report }: { report: any }) {
  const [isRating, setIsRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const rateMutation = useRateAuthority();
  const { toast } = useToast();

  const handleRate = () => {
    if (!report.assignedAuthority?.id || rating === 0) return;
    rateMutation.mutate({ 
      id: report.assignedAuthority.id, 
      data: { rating, comment, reportId: report.id } 
    }, {
      onSuccess: () => {
        toast({ title: "Rating submitted", description: "Thank you for your feedback." });
        setIsRating(false);
      }
    });
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm border-emerald-900/30 overflow-hidden group">
      <Link href={`/problems/${report.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img src={report.photoUrl} alt="Fixed hazard" className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-xs font-bold backdrop-blur-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fixed
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-bold text-lg text-foreground capitalize leading-tight">
              {report.hazardType.replace(/_/g, ' ')}
            </h3>
            <p className="text-xs text-accent truncate">{report.addressFull}</p>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
          <div className="text-xs text-muted-foreground">
            Resolved {report.resolvedAt ? formatDistanceToNow(new Date(report.resolvedAt), { addSuffix: true }) : ''}
          </div>
          <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
            Level {report.currentLevel} Resolution
          </div>
        </div>
        
        {report.assignedAuthority && !isRating && (
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground block text-xs">Fixed by</span>
              <span className="font-medium text-foreground">{report.assignedAuthority.name}</span>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10" onClick={() => setIsRating(true)}>
              Rate Officer
            </Button>
          </div>
        )}

        {isRating && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`w-6 h-6 cursor-pointer transition-colors ${rating >= star ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary/50'}`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <Textarea 
              placeholder="Leave a short comment..." 
              className="h-16 text-xs bg-background/50 resize-none border-border"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => setIsRating(false)}>Cancel</Button>
              <Button size="sm" className="flex-1 h-8 text-xs bg-primary text-primary-foreground" disabled={rating === 0 || rateMutation.isPending} onClick={handleRate}>Submit</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}