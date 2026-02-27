import { 
  Pill, 
  Search, 
  Plus, 
  MoreHorizontal
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

const medsData = [
  { name: "Amoxicillin", dose: "500mg", type: "Capsule", stock: "In Stock", price: "$12.00" },
  { name: "Lisinopril", dose: "10mg", type: "Tablet", stock: "Low Stock", price: "$8.50" },
  { name: "Metformin", dose: "850mg", type: "Tablet", stock: "In Stock", price: "$15.20" },
  { name: "Atorvastatin", dose: "20mg", type: "Tablet", stock: "Out of Stock", price: "$22.00" },
  { name: "Albuterol", dose: "90mcg", type: "Inhaler", stock: "In Stock", price: "$45.00" },
];

export default function Medications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Medications</h1>
          <p className="text-muted-foreground text-sm mt-1">Pharmacy inventory and drug list.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white h-9 gap-2">
          <Plus className="w-4 h-4" />
          Add Medication
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0b1121] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#151b2b]/50">
            <TableRow className="border-white/5">
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Name</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Dosage</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Type</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Stock Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Price</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medsData.map((item) => (
              <TableRow key={item.name} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-semibold text-white px-4">{item.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm px-4">{item.dose}</TableCell>
                <TableCell className="text-muted-foreground text-sm px-4">{item.type}</TableCell>
                <TableCell className="px-4">
                  <Badge variant="outline" className={`
                    ${item.stock === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      item.stock === 'Low Stock' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'} 
                    text-[10px]
                  `}>
                    {item.stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-white font-medium px-4">{item.price}</TableCell>
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
