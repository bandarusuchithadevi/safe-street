import { useGetTopAuthorities, useListAuthorities, Department } from "@workspace/api-client-react";
import { NightCanvas } from "@/components/NightCanvas";
import { AuthorityCard } from "@/components/AuthorityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award } from "lucide-react";
import { useState } from "react";

export default function Heroes() {
  const [department, setDepartment] = useState<Department | "all">("all");
  
  const { data: topAuthorities, isLoading: topLoading } = useGetTopAuthorities({ limit: 3 });
  const { data: authorities, isLoading: listLoading } = useListAuthorities({ 
    department: department !== "all" ? department : undefined,
    limit: 50
  });

  return (
    <div className="relative min-h-screen pb-24">
      <NightCanvas scene="office" />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary/10 border border-primary/20">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Authority Leaderboard</h1>
          <p className="text-accent text-lg">Recognizing the ward officers and engineers who take our streets seriously.</p>
        </div>

        {/* Top 3 */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6 text-center">Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full bg-card/50 rounded-xl" />)
            ) : topAuthorities?.map(auth => (
              <AuthorityCard key={auth.id} authority={auth} detailed />
            ))}
          </div>
        </div>

        {/* All Authorities */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">All Authorities</h2>
            <Select value={department} onValueChange={(v) => setDepartment(v as Department | "all")}>
              <SelectTrigger className="w-full sm:w-[200px] bg-background/50">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {Object.values(Department).map(d => (
                  <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listLoading ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full bg-card/50 rounded-xl" />)
            ) : authorities?.map(auth => (
              <AuthorityCard key={auth.id} authority={auth} />
            ))}
          </div>
          
          <div className="mt-12 text-center text-sm text-muted-foreground border-t border-border pt-8">
            Performance ratings are reviewed by District Collector and Divisional Commissioner for annual APAR appraisal.
          </div>
        </div>
      </div>
    </div>
  );
}