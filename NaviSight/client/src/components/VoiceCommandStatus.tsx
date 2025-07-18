import React, { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { getSpeechRecognition, detectCommand } from "@/lib/speechRecognition";

interface VoiceCommandStatusProps {
  onCommand: (command: string) => void;
}

const VoiceCommandStatus: React.FC<VoiceCommandStatusProps> = ({ onCommand }) => {
  const { isVoiceCommandActive } = useAppContext();
  
  useEffect(() => {
    const speechRecognition = getSpeechRecognition();
    
    if (!speechRecognition) return;
    
    if (isVoiceCommandActive) {
      speechRecognition.onResult(({ transcript, isFinal }) => {
        if (isFinal) {
          const command = detectCommand(transcript);
          if (command) {
            onCommand(command);
          }
        }
      });
      
      speechRecognition.onError((error) => {
        console.error("Speech recognition error:", error);
      });
      
      speechRecognition.start();
    } else {
      speechRecognition.stop();
    }
    
    return () => {
      if (speechRecognition.isListening) {
        speechRecognition.stop();
      }
    };
  }, [isVoiceCommandActive, onCommand]);

  return (
    <div className="w-full max-w-md mb-6">
      <div className="flex items-center justify-center p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow">
        <span 
          className={`h-3 w-3 rounded-full mr-3 ${
            isVoiceCommandActive 
              ? "bg-success animate-pulse" 
              : "bg-destructive"
          }`}
          aria-hidden="true"
        />
        <p className="text-lg">
          {isVoiceCommandActive
            ? "Listening for commands..."
            : "Voice commands inactive"}
        </p>
      </div>
    </div>
  );
};

export default VoiceCommandStatus;
