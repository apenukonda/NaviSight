import React from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGrantPermission: () => void;
}

const PermissionDialog: React.FC<PermissionDialogProps> = ({ 
  open, 
  onOpenChange, 
  onGrantPermission 
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background sm:max-w-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <Camera className="h-12 w-12 text-secondary mb-4" />
          
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Camera Permission Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg mt-2">
              NaviSight needs access to your camera to help describe your surroundings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="mt-6 w-full flex flex-col gap-2">
            <Button 
              className="bg-primary text-white w-full" 
              onClick={() => {
                onGrantPermission();
                onOpenChange(false);
              }}
            >
              Allow Camera Access
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-foreground/70"
              onClick={() => onOpenChange(false)}
            >
              Not Now
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PermissionDialog;
