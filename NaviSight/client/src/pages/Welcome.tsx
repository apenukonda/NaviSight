import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/textToSpeech";
import { getSpeechRecognition } from "@/lib/speechRecognition";
import { useAppContext } from "@/contexts/AppContext";
import ThemeToggle from "@/components/ThemeToggle";

const Welcome: React.FC = () => {
  const [, setLocation] = useLocation();
  const { showError } = useAppContext();
  const [hasSpoken, setHasSpoken] = useState(false);
  const [listeningForConfirmation, setListeningForConfirmation] = useState(false);
  const speechRecognitionRef = useRef<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Initial welcome announcement with a slight delay
    const timer = setTimeout(() => {
      playWelcomeMessage();
    }, 1000);

    return () => {
      clearTimeout(timer);
      // Cleanup speech recognition
      if (speechRecognitionRef.current && speechRecognitionRef.current.isListening) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  const playWelcomeMessage = () => {
    speak(
      "Welcome to NaviSight. I am your navigation assistant designed to help you navigate indoor spaces. " +
      "I will describe what's around you when you say 'take a picture'. " +
      "To begin, please say 'yes' or 'continue', or press the large button on your screen."
    ).then(() => {
      setHasSpoken(true);
      // Small delay before starting to listen to avoid picking up echoes
      setTimeout(() => {
        startListeningForConfirmation();
      }, 500);
    }).catch(error => {
      console.error("TTS error:", error);
      showError("Couldn't play voice instructions. Please press the continue button.");
    });
  };

  const startListeningForConfirmation = () => {
    const speechRecognition = getSpeechRecognition();
    if (!speechRecognition) {
      showError("Speech recognition is not supported in your browser");
      return;
    }

    // Store the reference for cleanup
    speechRecognitionRef.current = speechRecognition;
    
    // Make sure any previous instances are stopped
    if (speechRecognition.isListening) {
      speechRecognition.stop();
    }

    setListeningForConfirmation(true);

    speechRecognition.onResult(({ transcript, isFinal }) => {
      if (isFinal) {
        console.log("Recognized speech:", transcript);
        const lowerTranscript = transcript.toLowerCase();
        if (
          lowerTranscript.includes("yes") ||
          lowerTranscript.includes("continue") ||
          lowerTranscript.includes("start") ||
          lowerTranscript.includes("okay") ||
          lowerTranscript.includes("ok") ||
          lowerTranscript.includes("proceed")
        ) {
          handleContinue();
        }
      }
    });

    speechRecognition.onError((error) => {
      console.error("Speech recognition error:", error);
      setListeningForConfirmation(false);
      
      // If we haven't exceeded retry attempts, try again
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        
        // Speak a prompt and try listening again
        speak("I didn't hear you. Please say 'yes' or 'continue' to begin.").then(() => {
          setTimeout(() => {
            startListeningForConfirmation();
          }, 500);
        }).catch(err => {
          console.error("TTS retry error:", err);
        });
      } else {
        showError("Failed to recognize speech. Please press the continue button.");
      }
    });

    try {
      speechRecognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      showError("Failed to start speech recognition. Please press the continue button.");
    }
  };

  const handleContinue = () => {
    // Stop listening if we're still listening for confirmation
    if (speechRecognitionRef.current && speechRecognitionRef.current.isListening) {
      speechRecognitionRef.current.stop();
    }

    // Provide voice feedback before navigating
    speak("Starting NaviSight. Get ready to explore.").then(() => {
      // Navigate to main page
      setLocation("/main");
    }).catch(error => {
      console.error("TTS error:", error);
      // Navigate anyway if speech fails
      setLocation("/main");
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <ThemeToggle />
      
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-primary mb-4">NaviSight</h1>
        <p className="text-2xl mb-8">Voice Navigation Assistant</p>
        
        <div className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg mb-8">
          <p className="text-xl mb-4">
            I'll help you navigate indoor spaces by describing what's around you.
          </p>
          <p className="text-xl font-medium">
            {hasSpoken 
              ? "Please say 'YES' or 'CONTINUE' to begin..."
              : "Welcome! Loading voice instructions..."}
          </p>
        </div>
        
        <Button 
          className="w-full py-8 text-2xl bg-primary text-white rounded-xl"
          onClick={handleContinue}
        >
          Continue
        </Button>
        
        {listeningForConfirmation && (
          <div className="mt-4 flex items-center justify-center">
            <span className="h-3 w-3 bg-success animate-pulse rounded-full mr-2"></span>
            <p>Listening for your response...</p>
          </div>
        )}

        {retryCount > 0 && (
          <div className="mt-2 text-amber-500">
            <p>Having trouble hearing you. Please speak clearly or press the button.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Welcome;