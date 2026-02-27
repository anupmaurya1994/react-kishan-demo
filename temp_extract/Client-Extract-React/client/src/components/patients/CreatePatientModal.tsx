import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, X } from "lucide-react";

interface CreatePatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePatientModal({ open, onOpenChange }: CreatePatientModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0b1121] border-white/10 text-white p-0 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Create Patient</DialogTitle>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Switch id="insurance-verified" className="data-[state=checked]:bg-blue-600" />
              <Label htmlFor="insurance-verified" className="text-xs font-medium text-white/70">Insurance Verified</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="auto-claims" className="data-[state=checked]:bg-blue-600" />
              <Label htmlFor="auto-claims" className="text-xs font-medium text-white/70">Auto Claims Status</Label>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">Primary Insurance</Label>
              <Select>
                <SelectTrigger className="bg-[#151b2b] border-white/5 h-10 text-sm focus:ring-0">
                  <SelectValue placeholder="Select insurance..." />
                </SelectTrigger>
                <SelectContent className="bg-[#151b2b] border-white/10 text-white">
                  <SelectItem value="aetna">Aetna</SelectItem>
                  <SelectItem value="cigna">Cigna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">Policy Number</Label>
              <Input className="bg-[#151b2b] border-white/5 h-10 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">Secondary Insurance</Label>
              <Select>
                <SelectTrigger className="bg-[#151b2b] border-white/5 h-10 text-sm focus:ring-0">
                  <SelectValue placeholder="Select insurance..." />
                </SelectTrigger>
                <SelectContent className="bg-[#151b2b] border-white/10 text-white">
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">Secondary Policy #</Label>
              <Input className="bg-[#151b2b] border-white/5 h-10 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="space-y-2 col-span-1">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">First Name *</Label>
              <Input className="bg-[#151b2b] border-white/5 h-10 text-sm" />
            </div>
            <div className="space-y-2 col-span-1">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">Last Name *</Label>
              <Input className="bg-[#151b2b] border-white/5 h-10 text-sm" />
            </div>
            <div className="space-y-2 col-span-1">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">Date of Birth *</Label>
              <div className="relative">
                <Input placeholder="dd/mm/yyyy" className="bg-[#151b2b] border-white/5 h-10 text-sm pr-10" />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              </div>
            </div>
            <div className="space-y-2 col-span-1">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">Gender</Label>
              <Select>
                <SelectTrigger className="bg-[#151b2b] border-white/5 h-10 text-sm focus:ring-0">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-[#151b2b] border-white/10 text-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">SSN</Label>
              <Input placeholder="XXX-XX-XXXX" className="bg-[#151b2b] border-white/5 h-10 text-sm" />
            </div>
            <div className="space-y-2 col-span-1">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">Phone</Label>
              <Input className="bg-[#151b2b] border-white/5 h-10 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4 items-end">
            <div className="space-y-2 col-span-1">
              <Label className="text-[11px] uppercase tracking-wider text-white/50">Date of Service</Label>
              <div className="relative">
                <Input defaultValue="19/01/2026" className="bg-[#151b2b] border-white/5 h-10 text-sm pr-10" />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              </div>
            </div>
            <div className="col-span-1">
              <Button variant="outline" className="w-full bg-[#151b2b] border-white/5 h-10 text-[11px] font-semibold text-white/50 uppercase tracking-wider gap-2">
                <ShieldCheck className="w-3 h-3" />
                Verify Primary
              </Button>
            </div>
            <div className="col-span-1">
              <Button variant="outline" className="w-full bg-[#151b2b] border-white/5 h-10 text-[11px] font-semibold text-white/50 uppercase tracking-wider gap-2">
                <ShieldCheck className="w-3 h-3" />
                Verify Secondary
              </Button>
            </div>
            <div className="col-span-1">
              <Button variant="outline" className="w-full bg-[#151b2b] border-white/5 h-10 text-[11px] font-semibold text-white/50 uppercase tracking-wider gap-2">
                <Search className="w-3 h-3" />
                Coverage Discovery
              </Button>
            </div>
            <div className="col-span-1">
              <Button variant="outline" className="w-full bg-[#151b2b] border-white/5 h-10 text-[11px] font-semibold text-white/50 uppercase tracking-wider gap-2">
                <FileText className="w-3 h-3" />
                Check Claim Status
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-white/50">Notes</Label>
            <Textarea className="bg-[#151b2b] border-white/5 min-h-[100px] resize-none" />
          </div>
        </div>

        <DialogFooter className="bg-[#151b2b]/30 p-4 gap-2 flex items-center justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-white/10 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 h-9 px-6"
          >
            Cancel
          </Button>
          <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white h-9 px-8">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { ShieldCheck, Search, FileText } from "lucide-react";
