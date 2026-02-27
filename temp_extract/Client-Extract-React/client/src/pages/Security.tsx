import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Eye, 
  ShieldAlert,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Security() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Security</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account security and authentication settings.</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-[#151b2b]/50 border border-white/10 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Two-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 h-8 text-xs">Enable</Button>
        </div>

        <div className="bg-[#151b2b]/50 border border-white/10 rounded-xl p-6 space-y-6">
          <h3 className="text-white font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" /> Active Sessions
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded bg-black/20 border border-white/5">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-white">Chrome on macOS</div>
                  <div className="text-[10px] text-muted-foreground">New York, USA • Current session</div>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px]">ACTIVE</Badge>
            </div>
          </div>
          <Button variant="ghost" className="text-red-400 hover:text-red-400 hover:bg-red-400/10 text-xs h-8">Log out all other sessions</Button>
        </div>
      </div>
    </div>
  );
}
