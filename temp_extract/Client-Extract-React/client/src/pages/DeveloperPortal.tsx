import { 
  Terminal, 
  Code2, 
  Key, 
  Webhook, 
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeveloperPortal() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Developer Portal</h1>
        <p className="text-muted-foreground text-sm">API access, webhooks, and technical documentation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-[#151b2b]/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" /> API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/30 p-3 rounded font-mono text-xs text-muted-foreground border border-white/5">
              sk_test_51Mz...7k9a
            </div>
            <Button className="w-full bg-white text-black hover:bg-white/90 text-xs h-8">Rotate Key</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#151b2b]/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Webhook className="w-4 h-4 text-purple-400" /> Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">0 endpoints configured.</p>
            <Button variant="outline" className="w-full border-white/10 text-xs h-8">Add Endpoint</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#151b2b]/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-green-400" /> Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-white">4,281</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Requests this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-[#151b2b]/50 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold">Documentation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
            <h4 className="text-sm font-medium text-white group-hover:text-blue-400">Authentication Guide</h4>
            <p className="text-xs text-muted-foreground mt-1">Learn how to authenticate your API requests.</p>
          </div>
          <div className="p-4 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
            <h4 className="text-sm font-medium text-white group-hover:text-blue-400">Endpoint Reference</h4>
            <p className="text-xs text-muted-foreground mt-1">Complete list of available REST endpoints.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
