import { NightCanvas } from "@/components/NightCanvas";
import { Shield, Lock, MapPin, ArrowRight, PhoneCall } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetStatsOverview } from "@workspace/api-client-react";

export default function About() {
  const { data: stats } = useGetStatsOverview();

  return (
    <div className="relative min-h-screen pb-24">
      <NightCanvas scene="arch" />
      
      <div className="container mx-auto px-4 pt-16 max-w-4xl relative z-10">
        
        {/* Mission */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 drop-shadow-md">
            Our Mission
          </h1>
          <p className="text-xl md:text-2xl text-accent font-serif max-w-2xl mx-auto leading-relaxed">
            We believe civic dignity is a fundamental right. SafeStreet exists to make the authorities accountable to the citizens they serve, transforming crumbling roads into safe pathways.
          </p>
        </div>

        {/* Escalation Flow */}
        <section className="mb-20">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-8 text-center">The Escalation Engine</h2>
          <Card className="bg-card/60 backdrop-blur border-card-border overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <FlowStep level={1} title="Ward Officer" desc="Initial assignment via GPS" />
                <FlowArrow />
                <FlowStep level={2} title="District Engineer" desc="Escalates after 3 days" />
                <FlowArrow />
                <FlowStep level={3} title="District Collector" desc="Escalates after 6 days" />
                <FlowArrow />
                <FlowStep level={4} title="Divisional Commissioner" desc="Escalates after 9 days" />
                <FlowArrow />
                <FlowStep level={5} title="Principal Secretary" desc="Escalates after 12 days" color="text-destructive" border="border-destructive" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Card className="bg-card/50 backdrop-blur border-card-border">
            <CardContent className="p-6">
              <Lock className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Citizen Privacy</h3>
              <ul className="space-y-2 text-sm text-accent">
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> 100% Anonymous Reporting</li>
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> AES-256 Encrypted PII</li>
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> SHA-256 Hashed Reporter IDs</li>
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> 24h JWT Expiry</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-card-border">
            <CardContent className="p-6">
              <MapPin className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Coverage</h3>
              <p className="text-accent mb-4">
                Currently integrated with municipal frameworks across India.
              </p>
              <div className="flex justify-between items-end border-t border-border pt-4 mt-auto">
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats?.citiesCovered || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase">Cities</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats?.statesCovered || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase">States</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Help Lines */}
        <section className="mb-20">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-destructive" />
            Emergency Help Lines (India)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <HelpLine number="112" label="National Emergency" />
            <HelpLine number="100" label="Police" />
            <HelpLine number="101" label="Fire" />
            <HelpLine number="102" label="Ambulance" />
            <HelpLine number="1078" label="Disaster Mgt" />
          </div>
        </section>

        {/* About Website */}
        <section className="bg-background/80 backdrop-blur border-y border-border py-8 px-6 text-center">
          <p className="text-sm text-accent max-w-2xl mx-auto">
            <strong className="text-foreground">About this website:</strong> This platform is a civic accountability tool connecting citizens with their local authorities. For website problems or emergency technical contact, please reach out via our official channels. Do not use this tool for immediate life-threatening emergencies—use the national helplines listed above.
          </p>
        </section>

      </div>
    </div>
  );
}

function FlowStep({ level, title, desc, color = "text-primary", border = "border-primary" }: { level: number, title: string, desc: string, color?: string, border?: string }) {
  return (
    <div className={`w-full bg-background border ${border} rounded-lg p-4 flex items-center gap-4 relative z-10 shadow-lg`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold bg-muted ${color}`}>
        L{level}
      </div>
      <div>
        <div className="font-bold text-foreground">{title}</div>
        <div className="text-xs text-accent">{desc}</div>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="h-8 w-px bg-border my-1 relative flex justify-center -z-0">
      <ArrowRight className="w-4 h-4 text-muted-foreground absolute -bottom-2 rotate-90 bg-card rounded-full" />
    </div>
  );
}

function HelpLine({ number, label }: { number: string, label: string }) {
  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center hover:bg-destructive/20 transition-colors">
      <div className="text-2xl font-bold text-destructive mb-1">{number}</div>
      <div className="text-xs text-destructive-foreground/80 font-medium leading-tight">{label}</div>
    </div>
  );
}