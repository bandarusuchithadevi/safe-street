import { useState } from "react";
import { Link } from "wouter";
import { useListReports, HazardType, ReportStatus, Severity } from "@workspace/api-client-react";
import { NightCanvas } from "@/components/NightCanvas";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusPill } from "@/components/StatusPill";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, AlertTriangle, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Problems() {
  const [hazardType, setHazardType] = useState<HazardType | "all">("all");
  const [status, setStatus] = useState<ReportStatus | "all">("all");
  
  const { data: reports, isLoading } = useListReports({
    hazardType: hazardType !== "all" ? hazardType : undefined,
    status: status !== "all" ? status : undefined,
    limit: 50
  });

  return (
    <div className="relative min-h-screen pb-24">
      <NightCanvas scene="rain" />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Open Reports</h1>
          <p className="text-accent text-lg">Track hazards reported by citizens across the city.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card/80 backdrop-blur p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search locations..." 
              className="pl-9 bg-background/50 border-border"
            />
          </div>
          <Select value={hazardType} onValueChange={(v) => setHazardType(v as HazardType | "all")}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background/50">
              <SelectValue placeholder="Hazard Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hazards</SelectItem>
              {Object.values(HazardType).map(t => (
                <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus | "all")}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(ReportStatus).map(s => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-card/50 border-border overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : reports?.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-card/30 rounded-lg border border-dashed border-border backdrop-blur-sm">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-foreground mb-1">No reports found</h3>
              <p className="text-accent">Try adjusting your filters.</p>
            </div>
          ) : (
            reports?.map(report => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: any }) {
  return (
    <Link href={`/problems/${report.id}`} className="block group">
      <Card className="bg-card/80 backdrop-blur border-card-border overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,166,35,0.1)] hover:border-primary/50 relative transform perspective-1000 hover:rotate-x-2">
        <div className="relative h-48 bg-muted overflow-hidden">
          {report.photoUrl ? (
            <img 
              src={report.photoUrl} 
              alt={report.hazardType} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
              <AlertTriangle className="w-12 h-12 text-secondary-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <SeverityBadge severity={report.severity as Severity} />
            <StatusPill status={report.status} />
          </div>
        </div>
        
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-foreground capitalize group-hover:text-primary transition-colors">
              {report.hazardType.replace(/_/g, ' ')}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-accent line-clamp-2 mb-4 h-10">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
            <span className="truncate">{report.addressFull}</span>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">{report.upvotes}</span>
                <span>votes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">L{report.currentLevel}</span>
                <span>escalation</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}