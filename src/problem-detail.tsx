import { useParams } from "wouter";
import { useGetReport, useEscalateReport, useVerifyReport, useUpvoteReport, ReportStatus, Severity } from "@workspace/api-client-react";
import { NightCanvas } from "@/components/NightCanvas";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusPill } from "@/components/StatusPill";
import { AuthorityCard } from "@/components/AuthorityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { customIcon } from "@/components/MapPin";
import { MapPin, ThumbsUp, AlertCircle, ArrowUpRight, CheckCircle2, Clock, CalendarDays, Camera } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetReportQueryKey } from "@workspace/api-client-react";

export default function ProblemDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading } = useGetReport(id!);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const upvoteMutation = useUpvoteReport();
  const escalateMutation = useEscalateReport();
  const verifyMutation = useVerifyReport();

  const [verifyComment, setVerifyComment] = useState("");

  const handleUpvote = () => {
    if (!report) return;
    upvoteMutation.mutate({ id: report.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetReportQueryKey(report.id) });
        toast({ title: "Upvoted", description: "Report prioritized." });
      }
    });
  };

  const handleEscalate = () => {
    if (!report) return;
    escalateMutation.mutate({ id: report.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetReportQueryKey(report.id) });
        toast({ title: "Escalated", description: "Report pushed to next authority level." });
      }
    });
  };

  const handleVerify = () => {
    if (!report) return;
    verifyMutation.mutate({ id: report.id, data: { comment: verifyComment } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetReportQueryKey(report.id) });
        toast({ title: "Verified", description: "Thank you for confirming the fix.", className: "bg-emerald-950 text-emerald-50 border-emerald-800" });
        setVerifyComment("");
      }
    });
  };

  if (isLoading) {
    return <div className="min-h-screen pt-24"><div className="container mx-auto px-4"><Skeleton className="h-[600px] w-full bg-card/50" /></div></div>;
  }

  if (!report) return <div className="min-h-screen pt-24 text-center">Report not found</div>;

  const isResolved = report.status === "resolved";

  return (
    <div className="relative min-h-screen pb-24">
      <NightCanvas scene="rain" />
      
      <div className="container mx-auto px-4 pt-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/80 backdrop-blur border-card-border overflow-hidden">
              <div className="relative h-[400px] bg-muted">
                {report.photoUrl ? (
                  <img src={report.photoUrl} alt="Hazard" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-secondary/20">
                    <Camera className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground capitalize mb-2 drop-shadow-md">
                      {report.hazardType.replace(/_/g, ' ')}
                    </h1>
                    <div className="flex gap-2">
                      <SeverityBadge severity={report.severity as Severity} />
                      <StatusPill status={report.status} />
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6 text-accent">
                  <MapPin className="w-5 h-5 shrink-0 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-foreground font-medium">{report.addressFull}</p>
                    <p className="text-sm">{report.wardNumber ? `Ward ${report.wardNumber}, ` : ''}{report.district}, {report.state}</p>
                  </div>
                </div>
                
                {report.description && (
                  <div className="mb-6 p-4 rounded-lg bg-background/50 border border-border">
                    <p className="text-sm leading-relaxed text-foreground">{report.description}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-6 pt-6 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="gap-2 border-primary/30 hover:bg-primary/10 text-primary hover:text-primary"
                    onClick={handleUpvote}
                    disabled={upvoteMutation.isPending || isResolved}
                  >
                    <ThumbsUp className="w-4 h-4" /> 
                    {report.upvotes} Citizens Impacted
                  </Button>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    Reported {format(new Date(report.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="bg-card/80 backdrop-blur border-card-border overflow-hidden h-[300px] relative z-0">
              <MapContainer center={[report.latitude, report.longitude]} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[report.latitude, report.longitude]} icon={customIcon} />
              </MapContainer>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Authority */}
            {report.assignedAuthority ? (
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Assigned To</h3>
                <AuthorityCard authority={report.assignedAuthority} detailed />
              </div>
            ) : (
              <Card className="bg-card/50 border-dashed border-border p-6 text-center">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-accent">Routing to correct authority...</p>
              </Card>
            )}

            {/* Escalation Actions */}
            {!isResolved ? (
              <Card className="bg-destructive/5 border-destructive/20">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    Escalation Level {report.currentLevel}
                  </h3>
                  <p className="text-xs text-accent mb-4">
                    Reports automatically escalate every 3 days. If this is urgent, you can manually push it to the next level.
                  </p>
                  <Button 
                    className="w-full bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30"
                    onClick={handleEscalate}
                    disabled={escalateMutation.isPending}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Escalate to Level {Math.min((report.currentLevel || 1) + 1, 5)}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-emerald-950/20 border-emerald-900/30">
                <CardContent className="p-6">
                  <h3 className="font-bold text-emerald-500 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Fix Reported
                  </h3>
                  <p className="text-xs text-accent mb-4">
                    The authority marked this as resolved. Can you verify the fix?
                  </p>
                  <Textarea 
                    placeholder="Add a comment (optional)..." 
                    className="bg-background/50 border-border mb-3 text-sm resize-none"
                    value={verifyComment}
                    onChange={(e) => setVerifyComment(e.target.value)}
                  />
                  <Button 
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white"
                    onClick={handleVerify}
                    disabled={verifyMutation.isPending}
                  >
                    Verify Fix ({report.verificationCount} verifications)
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card className="bg-card/50 border-card-border">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">History</h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                  {report.assignmentHistory?.map((history, i) => (
                    <div key={history.id} className="relative pl-6">
                      <div className="absolute left-0 w-4 h-4 rounded-full bg-background border-2 border-primary -translate-x-2 mt-1" />
                      <div className="text-sm font-medium text-foreground">{history.authorityName || 'System'}</div>
                      <div className="text-xs text-muted-foreground mb-1">{format(new Date(history.assignedAt), "MMM d, h:mm a")}</div>
                      <div className="text-xs text-accent">{history.actionTaken || `Escalated to L${history.level}`}</div>
                    </div>
                  ))}
                  <div className="relative pl-6">
                    <div className="absolute left-0 w-4 h-4 rounded-full bg-background border-2 border-muted-foreground -translate-x-2 mt-1" />
                    <div className="text-sm font-medium text-foreground">Report Created</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(report.createdAt), "MMM d, h:mm a")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}