import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  useCreateReport,
  useClassifyHazard,
  useReverseGeocode,
  HazardType,
  Severity,
} from "@workspace/api-client-react";
import { NightCanvas } from "@/components/NightCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Upload,
  MapPin,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Navigation as NavIcon,
  Cpu,
} from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { MapUpdater, customIcon } from "@/components/MapPin";
import { motion, AnimatePresence } from "framer-motion";

export default function Report() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Form State
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(20.5937); // Default India
  const [longitude, setLongitude] = useState<number>(78.9629);
  const [address, setAddress] = useState<string>("");
  const [hazardType, setHazardType] = useState<HazardType | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [description, setDescription] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const classifyMutation = useClassifyHazard();
  const geocodeMutation = useReverseGeocode();
  const createMutation = useCreateReport();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      // Remove data URI prefix for API
      const base64 = result.split(",")[1];
      setPhotoBase64(base64);

      // Auto classify
      classifyMutation.mutate(
        { data: { photoBase64: base64 } },
        {
          onSuccess: (data) => {
            setHazardType(data.hazardType);
            setSeverity(data.severity);
            setStep(2);
          },
          onError: () => {
            toast({
              title: "Classification failed",
              description: "Please proceed and select manually.",
              variant: "destructive",
            });
            setStep(2);
          },
        },
      );
    };
    reader.readAsDataURL(file);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);

        geocodeMutation.mutate(
          { data: { latitude: lat, longitude: lng } },
          {
            onSuccess: (data) => {
              setAddress(data.addressFull);
            },
          },
        );
      },
      () => {
        toast({
          title: "Failed to get location",
          description: "Please allow location access.",
          variant: "destructive",
        });
      },
    );
  };

  const handleSubmit = () => {
    if (!photoBase64 || !latitude || !longitude) {
      toast({
        title: "Missing information",
        description: "Please complete all required steps.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(
      {
        data: {
          photoBase64,
          latitude,
          longitude,
          description,
        },
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Report Submitted",
            description: `Routed to ${data.assignedAuthority?.designation || "local authority"}`,
            className: "bg-emerald-950 text-emerald-50 border-emerald-800",
          });
          setLocation("/problems");
        },
        onError: () => {
          toast({
            title: "Failed to submit",
            description: "Please try again later.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <>
      <div className="relative min-h-screen pb-24">
        <NightCanvas scene="report" />

        <div className="container mx-auto px-4 pt-8 max-w-2xl relative z-10">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">
            Report a Hazard
          </h1>

          {/* Stepper */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"}`}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>

          <div className="bg-card/60 backdrop-blur-md border border-card-border rounded-xl overflow-hidden shadow-xl">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 text-center space-y-6"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Take a photo of the hazard
                    </h2>
                    <p className="text-accent text-sm mb-6">
                      Clear photos help our AI classify the problem accurately
                      and find the exact location.
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                  />

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={classifyMutation.isPending}
                    >
                      {classifyMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-5 h-5 mr-2" /> Open Camera
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-1/3 aspect-square rounded-lg overflow-hidden border border-border shrink-0">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-primary" /> AI
                          Classification
                        </h3>
                        {classifyMutation.isSuccess ? (
                          <div className="bg-background/50 p-3 rounded border border-border">
                            <div className="font-bold text-foreground capitalize mb-1">
                              {hazardType.replace(/_/g, " ")}
                            </div>
                            <p className="text-xs text-accent line-clamp-2">
                              {classifyMutation.data?.description}
                            </p>
                          </div>
                        ) : (
                          <Select
                            value={hazardType}
                            onValueChange={(v) =>
                              setHazardType(v as HazardType)
                            }
                          >
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select Hazard Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(HazardType).map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t.replace(/_/g, " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Confirm Location
                        </h3>
                        <div className="h-48 rounded overflow-hidden border border-border mb-2 relative z-0">
                          <MapContainer
                            center={[latitude, longitude]}
                            zoom={15}
                            style={{ height: "100%", width: "100%" }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker
                              position={[latitude, longitude]}
                              icon={customIcon}
                              draggable
                              eventHandlers={{
                                dragend: (e) => {
                                  const marker = e.target;
                                  const position = marker.getLatLng();
                                  setLatitude(position.lat);
                                  setLongitude(position.lng);
                                  geocodeMutation.mutate(
                                    {
                                      data: {
                                        latitude: position.lat,
                                        longitude: position.lng,
                                      },
                                    },
                                    {
                                      onSuccess: (d) =>
                                        setAddress(d.addressFull),
                                    },
                                  );
                                },
                              }}
                            />
                            <MapUpdater center={[latitude, longitude]} />
                          </MapContainer>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-secondary/50 hover:bg-secondary/20"
                            onClick={detectLocation}
                            disabled={geocodeMutation.isPending}
                          >
                            {geocodeMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <NavIcon className="w-4 h-4 mr-2" /> Detect
                                Location
                              </>
                            )}
                          </Button>
                        </div>
                        {address && (
                          <p className="text-xs text-accent mt-2 line-clamp-1">
                            {address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground"
                      onClick={() => setStep(3)}
                      disabled={!hazardType || !latitude}
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">
                      Additional Details (Optional)
                    </h2>
                    <Textarea
                      placeholder="Provide any specific landmarks, cross streets, or context..."
                      className="min-h-[120px] bg-background/50 resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-secondary-foreground shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        What happens next?
                      </h4>
                      <p className="text-xs text-accent mt-1 leading-relaxed">
                        Your report will be routed to the appropriate ward
                        officer via GPS boundary mapping. If not resolved within
                        3 days, it will escalate automatically to their
                        supervisor.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-[0_0_15px_rgba(245,166,35,0.3)]"
                      onClick={handleSubmit}
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : null}
                      Submit Report
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
