import { useParams } from "wouter";
import { useGetAuthority, useRateAuthority, Severity } from "@workspace/api-client-react";
import { NightCanvas } from "@/components/NightCanvas";
import { AuthorityCard } from "@/components/AuthorityCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAuthorityQueryKey } from "@workspace/api-client-react";

export default function AuthorityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: authority, isLoading } = useGetAuthority(id!);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const rateMutation = useRateAuthority();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleRate = () => {
    if (!authority || rating === 0) return;
    rateMutation.mutate({ 
      id: authority.id, 
      data: { rating, comment } 
    }, {
      onSuccess: () => {
        toast({ title: "Rating submitted", description: "Thank you for your feedback." });
        queryClient.invalidateQueries({ queryKey: getGetAuthorityQueryKey(authority.id) });
        setRating(0);
        setComment("");
      }
    });
  };

  if (isLoading) {
    return <div className="min-h-screen pt-24"><div className="container mx-auto px-4"><Skeleton className="h-[400px] w-full bg-card/50" /></div></div>;
  }

  if (!authority) return <div className="min-h-screen pt-24 text-center">Authority not found</div>;

  return (
    <div className="relative min-h-screen pb-24">
      <NightCanvas scene="office" />
      
      <div className="container mx-auto px-4 pt-8 max-w-4xl">
        <div className="mb-8">
          <AuthorityCard authority={authority} detailed />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground mb-4">Recent Resolutions</h2>
              <div className="space-y-4">
                {authority.recentResolutions?.length === 0 ? (
                  <p className="text-accent text-sm">No recent resolutions.</p>
                ) : (
                  authority.recentResolutions?.map(report => (
                    <Card key={report.id} className="bg-card/50 border-card-border overflow-hidden">
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="w-full sm:w-48 h-32 shrink-0 bg-muted">
                          {report.photoUrl && <img src={report.photoUrl} alt="Fixed hazard" className="w-full h-full object-cover filter grayscale-[20%]" />}
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-foreground capitalize">{report.hazardType.replace(/_/g, ' ')}</h3>
                            <SeverityBadge severity={report.severity as Severity} />
                          </div>
                          <p className="text-sm text-accent line-clamp-1 mb-2">{report.addressFull}</p>
                          <p className="text-xs text-muted-foreground mt-auto">
                            Resolved {report.resolvedAt ? formatDistanceToNow(new Date(report.resolvedAt), { addSuffix: true }) : ''}
                          </p>
                        </CardContent>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-foreground mb-4">Citizen Feedback</h2>
              <div className="space-y-4">
                {authority.recentRatings?.length === 0 ? (
                  <p className="text-accent text-sm">No recent ratings.</p>
                ) : (
                  authority.recentRatings?.map(rating => (
                    <div key={rating.id} className="bg-card/30 p-4 rounded-lg border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${rating.rating >= star ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })}</span>
                      </div>
                      {rating.comment && <p className="text-sm text-accent italic">"{rating.comment}"</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Rate this Officer
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-8 h-8 cursor-pointer transition-colors ${rating >= star ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary/50'}`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                  
                  <Textarea 
                    placeholder="Leave a comment (optional)..." 
                    className="h-24 bg-background/50 resize-none border-border"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  
                  <Button 
                    className="w-full bg-primary text-primary-foreground" 
                    disabled={rating === 0 || rateMutation.isPending} 
                    onClick={handleRate}
                  >
                    Submit Rating
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Ratings impact official performance reviews.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}