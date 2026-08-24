"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ShopNav from "@/components/ShopNav";
import { Settings, MapPin, Phone, Mail, Save, LogOut, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useShop, updateShop } from "@/hooks/useApi";

export default function ShopSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: shopData, loading } = useShop(user?.id || null);

  const [shopForm, setShopForm] = useState({
    name: "",
    description: "",
    locationId: "",
    phone: "",
    email: "",
    hours: {
      monday: "08:00 - 18:00",
      friday: "08:00 - 19:00",
      saturday: "09:00 - 19:00",
      sunday: "10:00 - 15:00",
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shopData?.shop) {
      const s = shopData.shop;
      setShopForm({
        name: s.name || "",
        description: s.description || "",
        locationId: s.locationId || "",
        phone: typeof s.contact === "object" ? s.contact.phone : "",
        email: typeof s.contact === "object" ? s.contact.email : "",
        hours: {
          monday: s.hours?.monday ? `${s.hours.monday.open} - ${s.hours.monday.close}` : "08:00 - 18:00",
          friday: s.hours?.friday ? `${s.hours.friday.open} - ${s.hours.friday.close}` : "08:00 - 19:00",
          saturday: s.hours?.saturday ? `${s.hours.saturday.open} - ${s.hours.saturday.close}` : "09:00 - 19:00",
          sunday: s.hours?.sunday ? `${s.hours.sunday.open} - ${s.hours.sunday.close}` : "10:00 - 15:00",
        },
      });
    }
  }, [shopData]);

  const handleLogout = () => { logout(); router.push("/"); };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateShop(user.id, {
        name: shopForm.name,
        description: shopForm.description,
        locationId: shopForm.locationId,
        contact: {
          phone: shopForm.phone,
          email: shopForm.email,
        },
      });
    } catch (e) {
      console.error("Failed to save:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ShopNav userId={user?.id} />
      <main className="p-3 sm:p-4 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />Shop Settings</h2>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />Logout
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Shop Name</Label>
                <Input value={shopForm.name} onChange={(e) => setShopForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea value={shopForm.description} onChange={(e) => setShopForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={shopForm.locationId} onChange={(e) => setShopForm((p) => ({ ...p, locationId: e.target.value }))} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={shopForm.phone} onChange={(e) => setShopForm((p) => ({ ...p, phone: e.target.value }))} className="pl-10" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" value={shopForm.email} onChange={(e) => setShopForm((p) => ({ ...p, email: e.target.value }))} className="pl-10" />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs mb-2 block">Working Hours</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><p className="text-[10px] text-muted-foreground">Mon-Thu</p><Input value={shopForm.hours.monday} onChange={(e) => setShopForm((p) => ({ ...p, hours: { ...p.hours, monday: e.target.value } }))} className="text-xs" /></div>
                  <div className="space-y-1"><p className="text-[10px] text-muted-foreground">Friday</p><Input value={shopForm.hours.friday} onChange={(e) => setShopForm((p) => ({ ...p, hours: { ...p.hours, friday: e.target.value } }))} className="text-xs" /></div>
                  <div className="space-y-1"><p className="text-[10px] text-muted-foreground">Saturday</p><Input value={shopForm.hours.saturday} onChange={(e) => setShopForm((p) => ({ ...p, hours: { ...p.hours, saturday: e.target.value } }))} className="text-xs" /></div>
                  <div className="space-y-1"><p className="text-[10px] text-muted-foreground">Sunday</p><Input value={shopForm.hours.sunday} onChange={(e) => setShopForm((p) => ({ ...p, hours: { ...p.hours, sunday: e.target.value } }))} className="text-xs" /></div>
                </div>
              </div>

              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
