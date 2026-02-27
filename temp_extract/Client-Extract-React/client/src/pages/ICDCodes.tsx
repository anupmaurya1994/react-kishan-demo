import { 
  Dna, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpDown,
  MoreHorizontal,
  Code2
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

const icdData = [
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications", category: "Endocrine", status: "Active" },
  { code: "I10", description: "Essential (primary) hypertension", category: "Circulatory", status: "Active" },
  { code: "J45.909", description: "Unspecified asthma, uncomplicated", category: "Respiratory", status: "Active" },
  { code: "M54.5", description: "Low back pain", category: "Musculoskeletal", status: "Active" },
  { code: "Z00.00", description: "Encounter for general adult medical examination", category: "General", status: "Active" },
];

export default function ICDCodes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ICD-10 Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse and manage diagnostic codes.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white h-9 gap-2">
          <Plus className="w-4 h-4" />
          Add Code
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search codes..." className="bg-[#151b2b] border-white/5 h-10 pl-10 text-sm" />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0b1121] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#151b2b]/50">
            <TableRow className="border-white/5">
              <TableHead className="w-12 px-4"><Checkbox className="border-white/20" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Code</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Description</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Category</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {icdData.map((item) => (
              <TableRow key={item.code} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="px-4"><Checkbox className="border-white/20" /></TableCell>
                <TableCell className="font-mono text-sm text-blue-400 font-bold">{item.code}</TableCell>
                <TableCell className="text-white text-sm">{item.description}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{item.category}</TableCell>
                <TableCell className="px-4">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
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
