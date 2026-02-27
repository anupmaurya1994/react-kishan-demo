import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Search, 
  UserPlus,
  Mail,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Columns,
  CreditCard,
  UserCircle,
  Settings2,
  ShieldCheck,
  Filter,
  Check,
  Circle,
  Trash2,
  Pencil,
  Loader2
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface User {
  username: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
}

const usersData = [
  { username: "jeffrey_collins81", name: "Jeffrey Collins", email: "jeffrey.stark98@hotmail.com", phone: "+14646410541", status: "Inactive", role: "Manager" },
  { username: "ashton.auer", name: "Ashton Auer", email: "ashton_hegmann67@yahoo.com", phone: "+14345495030", status: "Suspended", role: "Superadmin" },
  { username: "golda.gleason", name: "Golda Gleason", email: "golda.smith32@gmail.com", phone: "+14606427316", status: "Active", role: "Manager" },
  { username: "maurine.rutherford", name: "Maurine Rutherford", email: "maurine_bechtelar@gmail.com", phone: "+16544865144", status: "Suspended", role: "Manager" },
  { username: "alford.wehner", name: "Alford Wehner", email: "alford36@hotmail.com", phone: "+12134843128", status: "Active", role: "Manager" },
  { username: "rahsaan.hagenes", name: "Rahsaan Hagenes", email: "rahsaan_russel@yahoo.com", phone: "+18972356925", status: "Suspended", role: "Superadmin" },
  { username: "madge_armstrong...", name: "Madge Armstrong", email: "madge.lubowitz62@yahoo.com", phone: "+15702447980", status: "Active", role: "Superadmin" },
  { username: "john.gottlieb-weber", name: "John Gottlieb-Weber", email: "john_oberbrunner15@gmail.com", phone: "+19516279869", status: "Inactive", role: "Superadmin" },
  { username: "marilyne.mohr63", name: "Marilyne Mohr", email: "marilyne.weimann@yahoo.com", phone: "+14238963008", status: "Inactive", role: "Superadmin" },
  { username: "cordelia_sanford", name: "Cordelia Sanford", email: "cordelia81@yahoo.com", phone: "+13865989429", status: "Invited", role: "Superadmin" },
];

const statusOptions = [
  { label: "Active", value: "Active", count: 68 },
  { label: "Inactive", value: "Inactive", count: 56 },
  { label: "Invited", value: "Invited", count: 58 },
  { label: "Suspended", value: "Suspended", count: 59 },
];

const roleOptions = [
  { label: "Superadmin", value: "Superadmin", count: 125, icon: ShieldCheck },
  { label: "Admin", value: "Admin", count: 124, icon: UserPlus },
  { label: "Manager", value: "Manager", count: 116, icon: UserCircle },
  { label: "Cashier", value: "Cashier", count: 135, icon: CreditCard },
];

export default function UserList() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    name: "",
    email: "",
    phone: "",
    status: "Active",
    role: "Manager"
  });

  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        name: "",
        email: "",
        phone: "",
        status: "Active",
        role: "Manager"
      });
    }
    setIsUserFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsUserFormOpen(false);
      toast.success(editingUser ? "User updated successfully" : "User added successfully", {
        className: "bg-[#151b2b] border-white/10 text-white",
      });
    }, 800);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedRoles([]);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success("User deleted successfully", {
        className: "bg-[#151b2b] border-white/10 text-white",
      });
    }, 800);
  };

  return (
    <div className="space-y-6 bg-transparent min-h-full text-foreground font-sans transition-colors duration-300">
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground max-w-[400px]">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <span className="text-foreground font-medium">{userToDelete?.name}</span>? This action cannot be undone and the user will lose all access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-accent hover:text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white border-none min-w-[100px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingUser ? "Make changes to the user's profile here." : "Enter the details for the new user."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. john_doe"
                  className="bg-muted border-border text-foreground h-10 focus:ring-blue-500/20"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="bg-muted border-border text-foreground h-10 focus:ring-blue-500/20"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="bg-muted border-border text-foreground h-10 focus:ring-blue-500/20"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="bg-muted border-border text-foreground h-10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value} className="hover:bg-accent focus:bg-accent cursor-pointer">
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-muted border-border text-foreground h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value} className="hover:bg-accent focus:bg-accent cursor-pointer">
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUserFormOpen(false)}
                className="bg-transparent border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium min-w-[100px] border-none"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingUser ? "Save Changes" : "Add User")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User List</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your users and their roles here.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 border-border hover:bg-accent gap-2 text-foreground px-4 bg-background">
            Invite User <Mail className="w-4 h-4" />
          </Button>
          <Button 
            onClick={() => handleOpenForm()}
            className="h-10 bg-[#0f172a] hover:bg-[#1e293b] text-white dark:bg-white dark:text-black dark:hover:bg-white/90 gap-2 px-4 font-medium transition-all border-none rounded-lg"
          >
            Add User <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter users..." 
              className="h-9 border-border focus-visible:ring-blue-500/20 bg-muted pl-9 text-sm text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center">
                <Button variant="outline" className="h-9 border-dashed border-border text-foreground gap-2 px-3 hover:bg-accent bg-muted rounded-md transition-colors">
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
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] bg-card border-border p-1 shadow-2xl">
              <div className="relative p-2 pb-1">
                <Search className="absolute left-4 top-4 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Status" 
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
                    <span className="text-[10px] text-muted-foreground tabular-nums font-mono">{option.count}</span>
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

          {/* Role Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center">
                <Button variant="outline" className="h-9 border-dashed border-border text-foreground gap-2 px-3 hover:bg-accent bg-muted rounded-md transition-colors">
                  <Plus className="w-3.5 h-3.5" /> 
                  <span className="font-medium">Role</span>
                  {selectedRoles.length > 0 && (
                    <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border max-w-[150px] overflow-hidden">
                      {selectedRoles.map(role => (
                        <Badge key={role} className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 h-5 text-[10px] whitespace-nowrap">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] bg-card border-border p-1 shadow-2xl">
              <div className="relative p-2 pb-1">
                <Search className="absolute left-4 top-4 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Role" 
                  className="h-8 bg-transparent border-none pl-7 text-sm text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <DropdownMenuSeparator className="bg-border mx-1" />
              <div className="py-1">
                {roleOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.value}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleRole(option.value);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm group transition-colors"
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors text-foreground",
                      selectedRoles.includes(option.value) 
                        ? "bg-primary border-primary" 
                        : "border-border group-hover:border-muted-foreground"
                    )}>
                      {selectedRoles.includes(option.value) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    {option.icon && <option.icon className="w-3.5 h-3.5 text-muted-foreground/60" />}
                    <span className="flex-1 text-sm text-foreground/90">{option.label}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums font-mono">{option.count}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              {selectedRoles.length > 0 && (
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
          
          {(selectedStatuses.length > 0 || selectedRoles.length > 0) && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="h-9 text-foreground font-medium text-sm hover:bg-accent px-3 flex items-center gap-2 ml-1"
            >
              Reset
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        
        <Button variant="outline" className="h-9 border-border gap-2 text-muted-foreground hover:text-foreground hover:bg-accent bg-muted">
          <Settings2 className="w-4 h-4" />
          View
        </Button>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden border border-border rounded-xl bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-background border-b border-border">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-12 px-4"><Checkbox className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4 py-5">Username <ArrowUpDown className="w-3.5 h-3.5 inline ml-1 opacity-40" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4">Name</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4">Email <ArrowUpDown className="w-3.5 h-3.5 inline ml-1 opacity-40" /></TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4">Phone Number</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4">Role</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData.map((user, i) => (
              <TableRow key={i} className="border-b border-border hover:bg-muted/30 transition-colors h-[56px] group">
                <TableCell className="px-4"><Checkbox className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" /></TableCell>
                <TableCell className="text-foreground font-medium text-sm px-4">{user.username}</TableCell>
                <TableCell className="text-foreground/90 text-sm px-4">{user.name}</TableCell>
                <TableCell className="text-foreground/80 text-sm px-4">{user.email}</TableCell>
                <TableCell className="text-foreground/80 text-sm px-4">{user.phone}</TableCell>
                <TableCell className="px-4">
                  <Badge variant="outline" className={cn(
                    "font-semibold px-2.5 py-0.5 rounded-lg border-none whitespace-nowrap text-[11px]",
                    user.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                    user.status === 'Invited' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                    user.status === 'Suspended' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                    'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground'
                  )}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4">
                  <div className="flex items-center gap-2 text-foreground/80 text-sm">
                    {user.role === 'Superadmin' ? <ShieldCheck className="w-4 h-4 text-blue-500/70" /> : 
                     user.role === 'Admin' ? <UserPlus className="w-4 h-4 text-muted-foreground/60" /> :
                     user.role === 'Cashier' ? <CreditCard className="w-4 h-4 text-muted-foreground/60" /> :
                     <UserCircle className="w-4 h-4 text-muted-foreground/60" />}
                    {user.role}
                  </div>
                </TableCell>
                <TableCell className="px-4 text-right">
                  <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Select defaultValue="10">
                   <SelectTrigger className="h-8 w-[70px] bg-background border-border text-xs">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                   </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">Rows per page</span>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xs text-muted-foreground">
              Page <span className="text-foreground font-medium">1</span> of <span className="text-foreground font-medium">50</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 bg-[#0f172a] text-white dark:bg-white dark:text-black border-none p-0 text-xs font-bold">1</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-foreground text-xs font-medium">2</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-foreground text-xs font-medium">3</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-foreground text-xs font-medium">4</Button>
              <span className="text-muted-foreground mx-1 text-xs">...</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-foreground text-xs font-medium">50</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
