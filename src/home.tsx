import { Link } from "wouter";
import { useGetStatsOverview, useGetHazardBreakdown, useGetTopCities, useGetRecentActivity, useGetTopAuthorities } from "@workspace/api-client-react";
import { NightCanvas } from "@/components/NightCanvas";
import { AuthorityCard } from "@/components/AuthorityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, ShieldAlert, Eye, Cpu, MapPin, BellRing, ChevronUp, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: hazardBreakdown, isLoading: hazardLoading } = useGetHazardBreakdown();
  const { data: topCities, isLoading: citiesLoading } = useGetTopCities({ limit: 4 });
  const { data: recentActivity, isLoading: activityLoading } = useGetRecentActivity({ limit: 5 });
  const { data: topAuthorities, isLoading: authoritiesLoading } = useGetTopAuthorities({ limit: 3 });

  return (
    <div className="relative min-h-screen">
      <NightCanvas scene="home" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 container mx-auto text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight tracking-tight drop-shadow-[0_0_15px_rgba(245,166,35,0.3)]">
            The night-watchman of Indian streets
          </h1>
          <p className="text-xl text-accent mb-10 leading-relaxed max-w-2xl mx-auto">
            Photograph hazards. AI classifies them. GPS routes them to the correct ward officer. Unresolved reports automatically escalate up the government hierarchy every 3 days.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/report" asChild>
              <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-md shadow-[0_0_20px_rgba(245,166,35,0.4)] transition-all hover:scale-105">
                Report a Hazard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/problems" asChild>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-secondary text-foreground hover:bg-secondary/20 hover:text-foreground text-lg px-8 py-6 rounded-md transition-all">
                View Open Reports
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Overview */}
      <section className="py-12 px-4 container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 bg-card/50" />)
          ) : stats ? (
            <>
              <StatCard label="Total Reports" value={stats.totalReports.toLocaleString()} />
              <StatCard label="Resolved" value={stats.resolvedReports.toLocaleString()} color="text-primary" />
              <StatCard label="Authorities" value={stats.totalAuthorities.toLocaleString()} />
              <StatCard label="Avg Resolution" value={`${stats.avgResolutionDays} days`} />
            </>
          ) : null}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 bg-background/80 backdrop-blur-md border-y border-border relative overflow-hidden">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-16 text-foreground">How Accountability Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-secondary/30 -translate-y-1/2 z-0" />
            
            {[
              { icon: Eye, title: "1. Photograph", desc: "Citizen snaps a photo of the hazard" },
              { icon: Cpu, title: "2. AI Classifies", desc: "System detects type and severity" },
              { icon: MapPin, title: "3. GPS Routes", desc: "Sent to the exact ward officer" },
              { icon: BellRing, title: "4. Authority Notified", desc: "Officer gets 3 days to fix it" },
              { icon: ChevronUp, title: "5. Escalation", desc: "Climbs hierarchy if ignored" }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-accent">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Section */}
      <section className="py-24 px-4 container mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            Hazard Breakdown
          </h2>
          <Card className="bg-card/50 backdrop-blur border-card-border p-6 h-[300px]">
            {hazardLoading ? (
              <Skeleton className="w-full h-full bg-secondary/20" />
            ) : hazardBreakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hazardBreakdown} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="hazardType" type="category" axisLine={false} tickLine={false} tick={{ fill: '#C4956A', fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: 'rgba(11, 31, 58, 0.5)' }} contentStyle={{ backgroundColor: '#0B1F3A', border: '1px solid #8B6B47', color: '#FFF8E8' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {hazardBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#F5A623' : '#8B6B47'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </Card>
        </div>

        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Top Responders</h2>
            <Link href="/heroes" className="text-primary hover:underline text-sm font-medium">View Leaderboard</Link>
          </div>
          <div className="space-y-4">
            {authoritiesLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 bg-card/50" />)
            ) : topAuthorities?.map(auth => (
              <AuthorityCard key={auth.id} authority={auth} />
            ))}
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="py-24 px-4 bg-background/90 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-serif font-bold mb-8 text-center text-foreground">Live Civic Action</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-secondary/50 before:to-transparent">
            {activityLoading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-3/4 mx-auto bg-card/50" />)
            ) : recentActivity?.map((activity, i) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-secondary text-secondary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {activity.kind === "report_resolved" ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <BellRing className="w-4 h-4" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border bg-card/50 backdrop-blur shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground text-sm">{activity.kind.replace(/_/g, ' ')}</span>
                    <time className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</time>
                  </div>
                  <p className="text-accent text-sm">{activity.message}</p>
                  {activity.location && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/>{activity.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, color = "text-foreground" }: { label: string, value: string | number, color?: string }) {
  return (
    <Card className="bg-card/40 border-card-border backdrop-blur-sm hover:bg-card/60 transition-colors">
      <CardContent className="p-6 text-center">
        <div className={`text-3xl md:text-4xl font-bold mb-2 ${color} drop-shadow-sm`}>{value}</div>
        <div className="text-sm font-medium text-accent uppercase tracking-wider">{label}</div>
      </CardContent>
    </Card>
  );
}
