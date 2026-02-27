import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  FileText, 
  AlertCircle, 
  Clock, 
  Wallet, 
  CheckCircle2, 
  Send, 
  Coins, 
  Activity, 
  Stethoscope
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const analyticsData = [
  { label: "Request for Documents", value: "$15,249", count: 139, subtext: "Orders awaiting documentation", icon: FileText, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  { label: "Denied Claims", value: "$10,340", count: 94, subtext: "Revenue from denied claims", icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  { label: "In Appeals", value: "$10,966", count: 100, subtext: "Orders pending appeal resolution", icon: Clock, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  { label: "Partial Payment", value: "$64,226", count: 716, subtext: "Partial reimbursements received", icon: Wallet, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  { label: "Approved for Payment", value: "$91,431", count: 964, subtext: "Claims with payments received", icon: ArrowUpRight, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  { label: "Fully Reimbursed", value: "$72,252", count: 674, subtext: "Payments received in full", icon: Coins, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  { label: "Submitted to Clearinghouse", value: "$107,395", count: 977, subtext: "Orders sent to billing", icon: Send, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { label: "Total Potential Revenue", value: "$115,747", count: null, subtext: "1228 orders x ~$107 median", icon: Coins, color: "text-gray-400", bg: "bg-white/5", border: "border-white/10" },
  { label: "Average Claim Value", value: "$107", count: 674, subtext: "Based on approved & reimbursed claims", icon: Activity, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  { label: "Most Common Test", value: "Complete Blood Count", count: 199, subtext: "Ordered 199 times", icon: Stethoscope, color: "text-gray-400", bg: "bg-white/5", border: "border-white/10" },
];

const revenuePipelineData = [
  { name: "Total Potential", value: 115747 },
  { name: "Submitted", value: 107395 },
  { name: "Approved", value: 91431 },
  { name: "Reimbursed", value: 72252 },
];

const reimbursementStatusData = [
  { name: "Fully Reimbursed", value: 42, color: "#10b981" },
  { name: "Partial Payment", value: 28, color: "#fbbf24" },
  { name: "Denied/Pending", value: 30, color: "#ef4444" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Dashboard</h2>
        <p className="text-muted-foreground text-sm">Comprehensive analytics and insights <span className="text-[10px] opacity-50">(drag tiles to reorder)</span></p>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-muted border border-border p-1 h-9">
          <TabsTrigger value="revenue" className="text-xs px-4 data-[state=active]:bg-background data-[state=active]:text-foreground">Revenue & Reimbursement</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs px-4 data-[state=active]:bg-background data-[state=active]:text-foreground">Orders Overview</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {analyticsData.map((item, i) => (
          <Card key={i} className={`${item.bg} ${item.border} border shadow-none hover:bg-opacity-80 transition-all cursor-pointer group`}>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className={`text-[11px] font-semibold uppercase tracking-wider ${item.color} opacity-80 group-hover:opacity-100`}>
                {item.label}
              </CardTitle>
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-foreground">{item.value}</span>
                {item.count !== null && (
                  <span className={`text-[11px] font-medium ${item.color} opacity-60`}>({item.count})</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{item.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="border-b border-border p-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Revenue Pipeline
            </CardTitle>
            <span className="text-[10px] text-muted-foreground">Revenue at each stage of the reimbursement process</span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenuePipelineData} layout="vertical" margin={{ left: 20, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="currentColor"
                    className="opacity-60"
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="border-b border-border p-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Reimbursement Status
            </CardTitle>
            <span className="text-[10px] text-muted-foreground">Breakdown of revenue by payment status</span>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-center">
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reimbursementStatusData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reimbursementStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-green-500">42%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Reimbursed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
