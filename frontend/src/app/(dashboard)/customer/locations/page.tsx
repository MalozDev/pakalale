"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Star, Search, Filter, ArrowRight, Clock, ArrowLeft, Loader2, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocations, useShops } from "@/hooks/useApi";

export default function LocationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const { data, loading } = useLocations({ search: searchQuery || undefined, specialty: selectedSpecialty });
  const { data: shopsData } = useShops();
  const allShops = shopsData?.shops || [];

  const locations = data?.locations || [];
  const allSpecialties = ["all", ...Array.from(new Set(locations.flatMap((l) => l.specialties || [])))];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
          <h1 className="text-sm font-bold">Trading Locations</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /><Input placeholder="Search locations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <div className="relative sm:w-48"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /><select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">{allSpecialties.map((s) => (<option key={s} value={s}>{s === "all" ? "All Specialties" : s}</option>))}</select></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {locations.map((location) => {
              const shopCount = allShops.filter((s) => s.locationId === location.slug || s.locationId === location.id).length;
              return (
                <Card key={location.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => router.push(`/customer/locations/${location.slug || location.id}`)}>
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{location.name}</h3>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{location.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">{(location.specialties || []).slice(0, 3).map((s) => (<Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>))}</div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /><span>{location.rating}</span></div>
                          <span>·</span>
                          <div className="flex items-center gap-1"><Store className="h-3 w-3" /><span>{shopCount} shops</span></div>
                        </div>
                        {location.hours && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{location.hours}</span></div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && locations.length === 0 && (<div className="text-center py-12"><MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm font-medium">No locations found</p><p className="text-xs text-muted-foreground">Try adjusting your search</p></div>)}
      </div>
    </div>
  );
}
