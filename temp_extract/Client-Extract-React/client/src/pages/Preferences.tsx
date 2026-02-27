import { 
  Settings, 
  User, 
  Bell, 
  Globe, 
  Shield, 
  Palette 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Preferences() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Preferences</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize your system experience and notifications.</p>
      </div>

      <div className="space-y-6">
        <section className="bg-[#151b2b]/50 border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-4 text-white font-semibold border-b border-white/5 pb-4">
            <Palette className="w-5 h-5 text-blue-400" /> Appearance
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Use the dark theme across the application.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Compact View</Label>
                <p className="text-xs text-muted-foreground">Show more data on tables with reduced padding.</p>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        <section className="bg-[#151b2b]/50 border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-4 text-white font-semibold border-b border-white/5 pb-4">
            <Bell className="w-5 h-5 text-orange-400" /> Notifications
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Email Alerts</Label>
                <p className="text-xs text-muted-foreground">Receive important updates via email.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Browser Notifications</Label>
                <p className="text-xs text-muted-foreground">Show real-time alerts on your desktop.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
