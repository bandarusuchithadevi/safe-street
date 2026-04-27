import { useGetStatsOverview, useGetTopCities, useGetRecentActivity } from "@workspace/api-client-react";
import { NightCanvas } from "@/components/NightCanvas";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function LivesChanged() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: topCities, isLoading: citiesLoading } = useGetTopCities({ limit: 6 });
  const { data: recentActivity, isLoading: activityLoading } = useGetRecentActivity({ limit: 10 });

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      <NightCanvas scene="sunrise" />
      
      {/* Particle overlay would be handled by canvas */}
      
      <div className="container mx-auto px-4 pt-16 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-4 mb-6 rounded-full bg-primary/20 border border-primary/30"
          >
            <Heart className="w-10 h-10 text-primary fill-primary" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 drop-shadow-md">
            Lives Changed
          </h1>
          <p className="text-xl text-accent max-w-2xl mx-auto leading-relaxed">
            Every resolved report is a safe walk home, a prevented accident, a neighborhood restored to dignity.
          </p>
        </div>

        {/* Big Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-card/40 border-primary/20 backdrop-blur-md">
            <CardContent className="p-8 text-center">
              {statsLoading ? <Skeleton className="h-16 w-32 mx-auto bg-primary/20" /> : (
                <div className="text-6xl font-bold text-primary mb-2 drop-shadow-[0_0_10px_rgba(245,166,35,0.3)]">
                  {stats?.resolvedReports.toLocaleString()}
                </div>
              )}
              <div className="text-lg text-foreground font-serif">Hazards Permanently Fixed</div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-primary/20 backdrop-blur-md">
            <CardContent className="p-8 text-center">
              {statsLoading ? <Skeleton className="h-16 w-32 mx-auto bg-primary/20" /> : (
                <div className="text-6xl font-bold text-primary mb-2 drop-shadow-[0_0_10px_rgba(245,166,35,0.3)]">
                  {stats?.avgResolutionDays}
                </div>
              )}
              <div className="text-lg text-foreground font-serif">Average Days to Resolution</div>
            </CardContent>
          </Card>
        </div>

        {/* Quotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[
            { quote: "I walked my daughter to school without holding my breath today. The open drain is finally sealed.", author: "Aarti, Mumbai" },
            { quote: "For three years that broken streetlight made the alley unsafe. SafeStreet got it fixed in 4 days.", author: "Ramesh, Delhi" },
            { quote: "The pothole that claimed so many scooter tires is gone. Our street feels like a street again.", author: "Karthik, Bengaluru" },
            { quote: "I didn't think the ward officer would care. But when it escalated to the Collector, action was immediate.", author: "Priya, Chennai" }
          ].map((item, i) => (
            <Card key={i} className="bg-card/60 backdrop-blur border-card-border p-6 hover:-translate-y-1 transition-transform">
              <p className="text-lg text-foreground italic mb-4 font-serif">"{item.quote}"</p>
              <p className="text-sm text-primary font-bold">— {item.author}</p>
            </Card>
          ))}
        </div>

        {/* City Impact */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6 text-center">City Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {citiesLoading ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 bg-card/40" />)
            ) : topCities?.map(city => (
              <div key={city.city} className="bg-card/40 border border-border rounded-lg p-4 text-center">
                <div className="font-bold text-foreground mb-1">{city.city}</div>
                <div className="text-sm text-accent">{city.resolved} resolved</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Action Ticker */}
        <div className="mt-16 bg-card/30 border border-border rounded-lg p-4 flex items-center gap-3 overflow-hidden">
          <Activity className="w-5 h-5 text-primary shrink-0 animate-pulse" />
          <div className="text-sm text-accent whitespace-nowrap overflow-hidden text-ellipsis">
            {activityLoading ? "Loading live impact..." : recentActivity?.map(a => a.message).join(" • ")}
          </div>
        </div>
      </div>
    </div>
  );
}