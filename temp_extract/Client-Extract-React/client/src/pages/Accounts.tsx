import { 
  ArrowUpDown, 
  CreditCard, 
  Search, 
  Filter, 
  Columns,
  Download,
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
import { Checkbox } from "@/components/ui/checkbox";

const accountsData = [
  { id: "ACC-00125", patient: "Jeffrey Collins", balance: "$1,250.00", lastPayment: "Jan 12, 2026", status: "Active", type: "Personal" },
  { id: "ACC-00126", patient: "Ashton Auer", balance: "$450.00", lastPayment: "Dec 28, 2025", status: "Past Due", type: "Insurance" },
  { id: "ACC-00127", patient: "Golda Gleason", balance: "$0.00", lastPayment: "Jan 18, 2026", status: "Paid", type: "Personal" },
  { id: "ACC-00128", patient: "Maurine Rutherford", balance: "$890.00", lastPayment: "Jan 05, 2026", status: "Active", type: "Insurance" },
  { id: "ACC-00129", patient: "Alford Wehner", balance: "$2,100.00", lastPayment: "Dec 15, 2025", status: "Collections", type: "Personal" },
];

export default function Accounts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage billing accounts and payment history.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white h-9 gap-2">
          <Plus className="w-4 h-4" />
          New Account
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search accounts..." 
            className="bg-[#151b2b] border-white/5 h-10 pl-10 text-sm focus-visible:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-[#151b2b] border-white/10 text-muted-foreground h-9 gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" className="bg-[#151b2b] border-white/10 text-muted-foreground h-9 gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0b1121] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#151b2b]/50 border-b border-white/10">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-12 px-4 py-4"><Checkbox className="border-white/20" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Account ID</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Patient</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Balance</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Last Payment</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Type</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountsData.map((account) => (
              <TableRow key={account.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="px-4 py-4"><Checkbox className="border-white/20" /></TableCell>
                <TableCell className="font-mono text-sm px-4 text-white/90">{account.id}</TableCell>
                <TableCell className="font-medium text-white px-4">{account.patient}</TableCell>
                <TableCell className="text-white font-medium px-4">{account.balance}</TableCell>
                <TableCell className="text-muted-foreground text-sm px-4">{account.lastPayment}</TableCell>
                <TableCell className="text-muted-foreground text-sm px-4">{account.type}</TableCell>
                <TableCell className="px-4">
                  <Badge variant="outline" className={`
                    ${account.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      account.status === 'Past Due' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      account.status === 'Collections' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'} 
                    font-medium px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                  `}>
                    {account.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 text-right">
                  <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
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

import { Plus } from "lucide-react";
