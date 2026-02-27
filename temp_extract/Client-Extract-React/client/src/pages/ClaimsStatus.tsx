import { 
  ArrowUpDown, 
  Columns, 
  Download, 
  Edit2, 
  Filter, 
  Search, 
  Layout as TableRowIcon,
  Plus,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";

const claimsData = [
  { id: "CLM-20250000425", sampleId: "SMP-500025", patient: "Dorothy Rivera", date: "12/19/2025", test: "Basic Metabolic Panel", cpt: "99232", billed: "$205.00", paid: "$155.00", insurance: "Kaiser Permanente", status: "Pending" },
  { id: "CLM-20250000424", sampleId: "SMP-500024", patient: "Brian Hall", date: "12/20/2025", test: "Genetic Screen Panel", cpt: "99231", billed: "$204.00", paid: "$154.00", insurance: "Humana", status: "Partially Paid" },
  { id: "CLM-20250000423", sampleId: "SMP-500023", patient: "Amanda Baker", date: "12/21/2025", test: "Vitamin D Test", cpt: "99285", billed: "$203.00", paid: "-", insurance: "United Healthcare", status: "Approved" },
  { id: "CLM-20250000422", sampleId: "SMP-500022", patient: "Kevin Nelson", date: "12/22/2025", test: "Kidney Function Panel", cpt: "99284", billed: "$202.00", paid: "-", insurance: "Cigna", status: "Paid" },
  { id: "CLM-20250000421", sampleId: "SMP-500021", patient: "Carol Adams", date: "12/23/2025", test: "Liver Function Test", cpt: "99283", billed: "$201.00", paid: "$151.00", insurance: "Blue Cross Blue Shield", status: "Paid" },
  { id: "CLM-20250000420", sampleId: "SMP-500020", patient: "Kenneth Green", date: "12/24/2025", test: "Basic Metabolic Panel", cpt: "99282", billed: "$200.00", paid: "$150.00", insurance: "Aetna", status: "In Review" },
  { id: "CLM-20250000419", sampleId: "SMP-500019", patient: "Deborah Roberts", date: "12/25/2025", test: "Genetic Screen Panel", cpt: "99281", billed: "$199.00", paid: "-", insurance: "Medicare", status: "Submitted" },
];

const statusOptions = [
  { label: "Paid", value: "Paid" },
  { label: "Approved", value: "Approved" },
  { label: "Partially Paid", value: "Partially Paid" },
  { label: "Pending", value: "Pending" },
  { label: "In Review", value: "In Review" },
  { label: "Submitted", value: "Submitted" },
];

export default function ClaimsStatus() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Claims Status</h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search all columns..." 
              className="bg-muted border-border h-10 pl-10 text-sm focus-visible:ring-blue-500/20 placeholder:text-muted-foreground/50"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-dashed border-border text-foreground gap-2 px-3 hover:bg-accent bg-muted">
                <Plus className="w-3.5 h-3.5" /> 
                <span className="font-medium">Status</span>
                {selectedStatuses.length > 0 && (
                  <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-1 h-5 min-w-[1.25rem] justify-center text-[10px]">
                      {selectedStatuses.length}
                    </Badge>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] bg-card border-border p-1 shadow-2xl">
              <div className="relative p-2 pb-1">
                <Search className="absolute left-4 top-4 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Filter status..." 
                  className="h-8 bg-transparent border-none pl-7 text-sm text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <DropdownMenuSeparator className="bg-border mx-1" />
              <div className="py-1">
                {statusOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.value}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleStatus(option.value);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm group transition-colors"
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors text-foreground",
                      selectedStatuses.includes(option.value) 
                        ? "bg-primary border-primary" 
                        : "border-border group-hover:border-muted-foreground"
                    )}>
                      {selectedStatuses.includes(option.value) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="flex-1 text-sm text-foreground/90">{option.label}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              {selectedStatuses.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-border mx-1" />
                  <DropdownMenuItem 
                    onSelect={clearFilters}
                    className="justify-center text-sm py-2 text-foreground hover:bg-accent cursor-pointer font-medium"
                  >
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedStatuses.length > 0 && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="h-10 text-foreground font-medium text-sm hover:bg-accent px-3 flex items-center gap-2"
            >
              Reset
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:text-foreground h-9 gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </Button>
          <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:text-foreground h-9 gap-2">
            <Columns className="w-4 h-4" />
            Columns
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12 px-4 py-4"><Checkbox className="border-border" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">Claim # <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">Sample ID <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">Patient <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">Date of Service <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">Test <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">CPT/HCPCS <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">Billed <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">Paid <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">Insurance <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground px-4 whitespace-nowrap">Status <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-right text-muted-foreground px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claimsData.map((claim, i) => (
              <TableRow key={i} className="border-b border-border hover:bg-accent/50 transition-colors h-[56px] group">
                <TableCell className="px-4"><Checkbox className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" /></TableCell>
                <TableCell className="text-foreground font-medium px-4">{claim.id}</TableCell>
                <TableCell className="text-muted-foreground px-4">{claim.sampleId}</TableCell>
                <TableCell className="text-foreground font-medium px-4">{claim.patient}</TableCell>
                <TableCell className="text-muted-foreground px-4">{claim.date}</TableCell>
                <TableCell className="text-foreground/80 px-4">{claim.test}</TableCell>
                <TableCell className="text-muted-foreground px-4">{claim.cpt}</TableCell>
                <TableCell className="text-foreground font-medium px-4">{claim.billed}</TableCell>
                <TableCell className="text-foreground font-medium px-4">{claim.paid}</TableCell>
                <TableCell className="text-muted-foreground px-4">{claim.insurance}</TableCell>
                <TableCell className="px-4">
                  <Badge variant="outline" className={cn(
                    "font-semibold px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap",
                    claim.status === 'Paid' ? 'bg-green-500/20 text-green-600 border-green-500/30' : 
                    claim.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' :
                    claim.status === 'Partially Paid' ? 'bg-orange-500/20 text-orange-600 border-orange-500/30' :
                    claim.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' :
                    claim.status === 'In Review' ? 'bg-blue-500/20 text-blue-600 border-blue-500/30' :
                    'bg-muted text-muted-foreground border-border'
                  )}>
                    {claim.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-4">
                  <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground/50 hover:text-foreground">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
