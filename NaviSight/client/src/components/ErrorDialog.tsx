import React from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  type?: "error" | "success";
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ 
  open, 
  onOpenChange, 
  message, 
  type = "error" 
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background sm:max-w-sm">
        <div className="flex flex-col items-center justify-center text-center">
          {type === "error" ? (
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          ) : (
            <CheckCircle2 className="h-12 w-12 text-success mb-4" />
          )}
          
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              {type === "error" ? "Error" : "Success"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg mt-2">
              {message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="mt-6 w-full flex justify-center">
            <Button 
              className={`${type === "error" ? "bg-primary" : "bg-success"} text-white`} 
              onClick={() => onOpenChange(false)}
            >
              Dismiss
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorDialog;
