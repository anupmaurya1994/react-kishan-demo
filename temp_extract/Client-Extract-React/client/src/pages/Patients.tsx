import { useState } from "react";
import { 
  ArrowUpDown, 
  Columns, 
  Download, 
  Edit2, 
  Filter, 
  Plus, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2,
  ArrowUpRight
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
import { useQuery } from "@tanstack/react-query";
import { Patient } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatePatientModal } from "@/components/patients/CreatePatientModal";

export default function Patients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Patients</h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search all columns..." 
            className="bg-muted border-border h-10 pl-10 text-sm focus-visible:ring-blue-500/20 placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:text-foreground h-9 gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:text-foreground h-9 gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </Button>
          <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:text-foreground h-9 gap-2">
            <Columns className="w-4 h-4" />
            Columns
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white h-9 gap-2 px-4 shadow-lg shadow-blue-600/20 whitespace-nowrap border-none"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </Button>
          <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:text-foreground h-9 gap-2 whitespace-nowrap">
            <ArrowUpRight className="w-4 h-4" />
            Import Patients
          </Button>
          <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:text-foreground h-9 gap-2 whitespace-nowrap">
            <ShieldCheck className="w-4 h-4" />
            Batch Eligibility
          </Button>
          <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:text-foreground h-9 gap-2 whitespace-nowrap px-4">
            <Search className="w-4 h-4" />
            Batch Discovery
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12 px-4 py-4"><Checkbox className="border-border" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4 whitespace-nowrap">Patient ID <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4 whitespace-nowrap">Name <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4 whitespace-nowrap">Date of Birth <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4 whitespace-nowrap">Email <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4 whitespace-nowrap">Phone <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4 whitespace-nowrap">Status <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase px-4 whitespace-nowrap">Accounts <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-50" /></TableHead>
              <TableHead className="text-right text-muted-foreground font-semibold text-xs uppercase px-4 whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id} className="border-border hover:bg-accent/50 transition-colors">
                <TableCell className="px-4 py-4"><Checkbox className="border-border" /></TableCell>
                <TableCell className="font-mono text-sm px-4 whitespace-nowrap text-foreground">{patient.patientId}</TableCell>
                <TableCell className="font-semibold text-foreground px-4 whitespace-nowrap">{patient.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm px-4 whitespace-nowrap">{patient.dateOfBirth}</TableCell>
                <TableCell className="text-muted-foreground text-sm px-4 whitespace-nowrap">{patient.email}</TableCell>
                <TableCell className="text-muted-foreground text-sm px-4 whitespace-nowrap">{patient.phone}</TableCell>
                <TableCell className="px-4 whitespace-nowrap">
                  <Badge variant="outline" className={`${patient.status === 'Verified' ? 'bg-blue-600/20 text-blue-500 border-blue-600/30' : 'bg-muted text-muted-foreground border-border'} font-semibold px-2 py-0.5 rounded text-[11px]`}>
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    0 account(s)
                    <Download className="w-3 h-3 opacity-30" />
                  </div>
                </TableCell>
                <TableCell className="text-right px-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground/50 hover:text-foreground">
                      <ShieldAlert className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground/50 hover:text-foreground">
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground/50 hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground/50 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreatePatientModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
