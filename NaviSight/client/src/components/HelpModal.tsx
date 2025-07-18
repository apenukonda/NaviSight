import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Help & Instructions</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-6 mt-2">
          <div>
            <h3 className="text-xl font-semibold mb-2">Voice Commands</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-lg">"Where am I?" - Captures and analyzes surroundings</li>
              <li className="text-lg">"What is nearby?" - Detects and describes nearby objects</li>
              <li className="text-lg">"Describe surroundings" - Complete scene description</li>
              <li className="text-lg">"Stop listening" - Turns off voice commands</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Using the Camera</h3>
            <p className="text-lg mb-2">Tap the "Describe Surroundings" button or use voice commands to capture an image.</p>
            <p className="text-lg mb-2">Hold the phone steady, pointing at what you want described.</p>
            <p className="text-lg">The app will automatically analyze and describe what it sees.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Navigation Tips</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-lg">Use in well-lit areas for best results</li>
              <li className="text-lg">The app will alert you of obstacles in your path</li>
              <li className="text-lg">Distances are approximate</li>
              <li className="text-lg">Use regular intervals for continuous guidance</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
            <p className="text-lg">For assistance, contact us at:</p>
            <p className="text-lg font-medium text-primary">support@navisight.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
