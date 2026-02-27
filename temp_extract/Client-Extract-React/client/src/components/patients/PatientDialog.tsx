import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePatient, useUpdatePatient } from "@/hooks/use-patients";
import { type Patient } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const patientFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is too short"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  status: z.enum(["Verified", "Unverified"]),
});

type FormData = z.infer<typeof patientFormSchema>;

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null; // If present, we are editing
}

export function PatientDialog({ open, onOpenChange, patient }: PatientDialogProps) {
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      status: "Unverified"
    }
  });

  useEffect(() => {
    if (open) {
      if (patient) {
        setValue("name", patient.name);
        setValue("email", patient.email);
        setValue("phone", patient.phone);
        setValue("dateOfBirth", patient.dateOfBirth);
        setValue("status", patient.status as "Verified" | "Unverified");
      } else {
        reset({
          name: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          status: "Unverified"
        });
      }
    }
  }, [open, patient, reset, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      if (patient) {
        await updateMutation.mutateAsync({
          id: patient.id,
          ...data
        });
      } else {
        // Generate a random ID for demo purposes
        const patientId = `PT-${Math.floor(100000 + Math.random() * 900000)}`;
        await createMutation.mutateAsync({
          ...data,
          patientId,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
        });
      }
      onOpenChange(false);
    } catch (e) {
      // Error handled by hook
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#151b2b] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {patient ? "Edit Patient" : "Add New Patient"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Full Name</Label>
            <Input 
              {...register("name")} 
              className="bg-black/20 border-white/10 focus:border-primary/50 text-white" 
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Date of Birth</Label>
              <Input 
                {...register("dateOfBirth")} 
                type="date"
                className="bg-black/20 border-white/10 focus:border-primary/50 text-white" 
              />
              {errors.dateOfBirth && <p className="text-red-400 text-xs">{errors.dateOfBirth.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Status</Label>
              <Select 
                onValueChange={(val) => setValue("status", val as "Verified" | "Unverified")}
                defaultValue={patient?.status || "Unverified"}
              >
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#151b2b] border-white/10 text-white">
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Email</Label>
            <Input 
              {...register("email")} 
              type="email"
              className="bg-black/20 border-white/10 focus:border-primary/50 text-white" 
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Phone</Label>
            <Input 
              {...register("phone")} 
              className="bg-black/20 border-white/10 focus:border-primary/50 text-white" 
              placeholder="+1 (555) 000-0000"
            />
            {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? "Saving..." : (patient ? "Update Patient" : "Create Patient")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
