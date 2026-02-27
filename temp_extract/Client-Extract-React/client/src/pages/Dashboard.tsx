import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarProvider,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserCircle, 
  CreditCard, 
  UserPlus, 
  Dna, 
  Pill, 
  Beaker, 
  Terminal, 
  Settings, 
  ShieldCheck, 
  Compass,
  Search,
  Moon,
  Sun,
  LogOut,
  Plus,
  ArrowUpRight,
  Filter,
  ArrowUpDown,
  Columns,
  ShieldAlert,
  Edit2,
  Trash2,
  Eye,
  Bell,
  ChevronDown,
  ChevronRight
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
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { SiReactos } from "react-icons/si";
import { useLocation } from "wouter";
import DashboardContent from "@/pages/DashboardContent";
import Patients from "@/pages/Patients";
import ClaimsStatus from "@/pages/ClaimsStatus";
import UserList from "@/pages/UserList";
import Accounts from "@/pages/Accounts";
import ICDCodes from "@/pages/ICDCodes";
import Medications from "@/pages/Medications";
import Laboratories from "@/pages/Laboratories";
import DeveloperPortal from "@/pages/DeveloperPortal";
import Preferences from "@/pages/Preferences";
import Security from "@/pages/Security";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const mainMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, shortcut: "Alt+1", path: "/dashboard" },
  { title: "Patients", icon: Users, shortcut: "Alt+2", path: "/patients" },
  { title: "Claims Status", icon: FileText, shortcut: "Alt+3", path: "/claims" },
];

const adminMenuItems = [
  { title: "Accounts", icon: CreditCard, path: "/accounts" },
  { 
    title: "Users", 
    icon: UserPlus, 
    path: "/users",
    items: [
      { title: "User List", path: "/users" },
      { title: "Permissions", path: "/users/permissions" },
      { title: "Roles", path: "/users/roles" },
    ]
  },
  { title: "ICD-10 Codes", icon: Dna, path: "/icd-codes" },
  { title: "Medications", icon: Pill, path: "/medications" },
  { title: "Laboratories", icon: Beaker, path: "/laboratories" },
  { title: "Developer Portal", icon: Terminal, path: "/developer" },
  { title: "Preferences", icon: Settings, path: "/preferences" },
  { title: "Security", icon: ShieldCheck, path: "/security" },
];

export default function Dashboard() {
  const { logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const renderContent = () => {
    if (location === "/dashboard") return <DashboardContent />;
    if (location === "/patients") return <Patients />;
    if (location === "/claims") return <ClaimsStatus />;
    if (location === "/accounts") return <Accounts />;
    if (location === "/icd-codes") return <ICDCodes />;
    if (location === "/medications") return <Medications />;
    if (location === "/laboratories") return <Laboratories />;
    if (location === "/developer") return <DeveloperPortal />;
    if (location === "/preferences") return <Preferences />;
    if (location === "/security") return <Security />;
    if (location.startsWith("/users")) return <UserList />;
    return <DashboardContent />;
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-background": theme === 'dark' ? "224 71% 4%" : "0 0% 100%",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties} defaultOpen={true}>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out">
          <SidebarHeader className="p-4 flex items-center justify-between h-14 overflow-hidden border-b-0">
            <div className="flex items-center gap-2 shrink-0">
               <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                 <SiReactos className="w-5 h-5 text-white dark:text-black" />
               </div>
               <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                 <span className="text-sm font-bold leading-tight">Shadcn Admin</span>
                 <span className="text-[10px] text-muted-foreground leading-tight font-medium">Vite + ShadcnUI</span>
               </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4 space-y-6">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold px-4 mb-2 group-data-[collapsible=icon]:hidden">
                MAIN
              </SidebarGroupLabel>
              <SidebarMenu className="px-2 gap-1">
                {mainMenuItems.map((item) => {
                  const path = item.path || "#";
                  const active = location === path;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={() => setLocation(path)}
                        isActive={active}
                        className={`h-9 px-3 rounded-lg transition-all duration-200 ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'}`}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/70'}`} />
                        <span className="flex-1 text-[13px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold px-4 mb-2 group-data-[collapsible=icon]:hidden">
                ADMIN
              </SidebarGroupLabel>
              <SidebarMenu className="px-2 gap-1">
                {adminMenuItems.slice(0, 5).map((item) => {
                  const path = item.path || "#";
                  const active = location === path || (item.items && item.items.some(sub => location === sub.path));
                  
                  if (item.items) {
                    return (
                      <Collapsible key={item.title} className="group/collapsible" defaultOpen={active}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton 
                              isActive={active}
                              className={`h-9 px-3 rounded-lg transition-all duration-200 ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'}`}
                            >
                              <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/70'}`} />
                              <span className="flex-1 text-[13px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                              <ChevronRight className="w-3.5 h-3.5 ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-40 group-data-[collapsible=icon]:hidden" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                            <SidebarMenuSub className="ml-4 mt-1 border-l border-sidebar-border pl-2 space-y-1">
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton 
                                    onClick={() => setLocation(subItem.path)}
                                    isActive={location === subItem.path}
                                    className={`h-8 px-3 text-[12px] rounded-md transition-colors ${location === subItem.path ? 'text-sidebar-accent-foreground font-medium' : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
                                  >
                                    {subItem.title}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={() => setLocation(path)}
                        isActive={active}
                        className={`h-9 px-3 rounded-lg transition-all duration-200 ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'}`}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/70'}`} />
                        <span className="flex-1 text-[13px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-[#4ade80] hover:text-[#4ade80] hover:bg-[#4ade80]/10 gap-2 h-9 px-2.5 bg-[#4ade80]/10 rounded-md border border-[#4ade80]/20 overflow-hidden"
            >
              <SiReactos className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium text-xs group-data-[collapsible=icon]:hidden">System Tour</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background transition-colors duration-300">
          {/* Top Navbar */}
          <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors" />
              <div className="relative max-w-sm w-full hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search" 
                  className="bg-muted/50 border-border h-9 pl-9 text-sm focus-visible:ring-primary/20 placeholder:text-muted-foreground/50 w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mounted && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6 bg-background">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
