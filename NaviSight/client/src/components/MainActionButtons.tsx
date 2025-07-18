import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Eye, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainActionButtonsProps {
  onDescribeClick: () => void;
}

const MainActionButtons: React.FC<MainActionButtonsProps> = ({ onDescribeClick }) => {
  const { isVoiceCommandActive, toggleVoiceCommand, isProcessing } = useAppContext();

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <Button
        className="bg-primary dark:bg-primary text-white py-6 px-6 rounded-xl shadow-md flex items-center justify-center nav-button text-xl font-medium h-auto"
        onClick={onDescribeClick}
        disabled={isProcessing}
      >
        <Eye className="mr-3 h-8 w-8" />
        Describe Surroundings
      </Button>
      
      <Button
        variant="outline"
        className="bg-surface-light dark:bg-surface-dark border-2 border-primary dark:border-primary py-6 px-6 rounded-xl shadow-md flex items-center justify-center nav-button text-xl font-medium text-primary dark:text-primary h-auto"
        onClick={toggleVoiceCommand}
      >
        {isVoiceCommandActive ? (
          <>
            <MicOff className="mr-3 h-8 w-8" />
            Stop Voice Commands
          </>
        ) : (
          <>
            <Mic className="mr-3 h-8 w-8" />
            Start Voice Commands
          </>
        )}
      </Button>
    </div>
  );
};

export default MainActionButtons;
