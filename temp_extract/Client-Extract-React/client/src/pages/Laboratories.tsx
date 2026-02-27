import { 
  Beaker, 
  Search, 
  Plus, 
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const labData = [
  { name: "Complete Blood Count", code: "LAB-01", turnaround: "24h", status: "Operational" },
  { name: "Lipid Panel", code: "LAB-02", turnaround: "48h", status: "Operational" },
  { name: "Urinalysis", code: "LAB-03", turnaround: "12h", status: "Maintenance" },
  { name: "Comprehensive Metabolic Panel", code: "LAB-04", turnaround: "24h", status: "Operational" },
  { name: "TSH Screen", code: "LAB-05", turnaround: "72h", status: "Operational" },
];

export default function Laboratories() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Laboratories</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage lab tests and facility status.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white h-9 gap-2">
          <Plus className="w-4 h-4" />
          Add Lab Test
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0b1121] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#151b2b]/50">
            <TableRow className="border-white/5">
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Test Name</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Code</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Turnaround</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labData.map((item) => (
              <TableRow key={item.code} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-semibold text-white px-4">{item.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground px-4">{item.code}</TableCell>
                <TableCell className="text-muted-foreground text-sm px-4">{item.turnaround}</TableCell>
                <TableCell className="px-4">
                  <Badge variant="outline" className={`
                    ${item.status === 'Operational' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-orange-500/10 text-orange-400 border-orange-500/20'} 
                    text-[10px]
                  `}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
