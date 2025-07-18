import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import { useAppContext } from "@/contexts/AppContext";
import { speak } from "@/lib/textToSpeech";
import { getSpeechRecognition } from "@/lib/speechRecognition";

const Help: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isVoiceCommandActive, toggleVoiceCommand } = useAppContext();
  const [voicePromptPlayed, setVoicePromptPlayed] = useState(false);

  useEffect(() => {
    // Start listening for voice commands when component mounts
    if (!isVoiceCommandActive) {
      toggleVoiceCommand();
    }

    // Announce help page with voice
    if (!voicePromptPlayed) {
      speak(
        "Help page. Learn about voice commands and navigation tips. Say 'back' to return to the previous screen or 'read' to have me read all instructions."
      ).then(() => {
        setVoicePromptPlayed(true);
      }).catch(error => {
        console.error("TTS error:", error);
      });
    }

    return () => {
      // No need to clean up voice commands here as they are managed globally
    };
  }, []);

  // Listen for voice commands
  useEffect(() => {
    if (!isVoiceCommandActive) return;

    const speechRecognition = getSpeechRecognition();
    if (!speechRecognition) return;

    speechRecognition.onResult(({ transcript, isFinal }) => {
      if (isFinal) {
        const lowerTranscript = transcript.toLowerCase();
        
        if (lowerTranscript.includes("back") || 
            lowerTranscript.includes("go back") ||
            lowerTranscript.includes("return")) {
          handleGoBack();
        } 
        else if (lowerTranscript.includes("main") || 
                lowerTranscript.includes("camera")) {
          handleMainClick();
        }
        else if (lowerTranscript.includes("settings")) {
          handleSettingsClick();
        }
        else if (lowerTranscript.includes("read") ||
                lowerTranscript.includes("read instructions") ||
                lowerTranscript.includes("read help")) {
          readAllInstructions();
        }
      }
    });
  }, [isVoiceCommandActive]);

  const readAllInstructions = () => {
    speak(
      "Voice commands: Say 'take a picture' to capture and analyze your surroundings. " +
      "Say 'What is nearby' to detect and describe objects. " +
      "Say 'Describe surroundings' for a complete scene description. " +
      "Say 'Stop listening' to turn off voice commands. " +
      "For using the camera, point your device at what you want described and say 'take a picture'. " +
      "Navigation tips: Use in well-lit areas for best results. The app will alert you of obstacles in your path. " +
      "Distances are approximate. Use regular intervals for continuous guidance."
    ).catch(error => {
      console.error("TTS error:", error);
    });
  };

  const handleGoBack = () => {
    speak("Going back.")
      .then(() => setLocation("/"))
      .catch(error => {
        console.error("TTS error:", error);
      });
  };

  const handleMainClick = () => {
    speak("Going to main screen.")
      .then(() => setLocation("/main"))
      .catch(error => {
        console.error("TTS error:", error);
      });
  };

  const handleSettingsClick = () => {
    speak("Opening settings.")
      .then(() => setLocation("/settings"))
      .catch(error => {
        console.error("TTS error:", error);
      });
  };

  return (
    <>
      <div className="flex flex-col min-h-screen p-4 pb-24">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-2xl font-bold">Help & Instructions</h1>
        </div>

        {/* Voice command status indicator */}
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg mb-6">
          <div className="flex items-center">
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
                ? "Voice commands active: Say 'read' to hear all instructions"
                : "Voice commands inactive"}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Voice Commands</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">"Take a picture" - Captures and analyzes surroundings</li>
              <li className="text-lg">"What is nearby?" - Detects and describes nearby objects</li>
              <li className="text-lg">"Describe surroundings" - Complete scene description</li>
              <li className="text-lg">"Quit" or "Exit" - Return to welcome screen</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Using the Camera</h2>
            <p className="text-lg mb-3">
              Simply say "take a picture" to capture and analyze what's around you.
            </p>
            <p className="text-lg mb-3">
              Hold the phone steady, pointing at what you want described.
            </p>
            <p className="text-lg">
              The app will automatically analyze and describe what it sees.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Navigation Tips</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-lg">Use in well-lit areas for best results</li>
              <li className="text-lg">The app will alert you of obstacles in your path</li>
              <li className="text-lg">Distances are approximate</li>
              <li className="text-lg">Use regular intervals for continuous guidance</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
            <p className="text-lg mb-2">For assistance, contact us at:</p>
            <p className="text-lg font-medium text-primary">support@navisight.com</p>
          </section>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            className="bg-primary text-white py-4 px-8 text-lg"
            onClick={readAllInstructions}
          >
            Read All Instructions
          </Button>
        </div>
      </div>
      
      <BottomNavigation 
        onHomeClick={handleGoBack}
        onSettingsClick={handleSettingsClick}
        onHelpClick={() => {}}
      />
    </>
  );
};

export default Help;
