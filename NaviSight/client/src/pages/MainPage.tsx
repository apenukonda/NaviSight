import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAppContext } from "@/contexts/AppContext";
import { speak } from "@/lib/textToSpeech";
import { getSpeechRecognition, detectCommand } from "@/lib/speechRecognition";
import { captureImageFromVideo } from "@/lib/camera";

import ThemeToggle from "@/components/ThemeToggle";
import CameraView from "@/components/CameraView";
import DescriptionOutput from "@/components/DescriptionOutput";
import BottomNavigation from "@/components/BottomNavigation";
import PermissionDialog from "@/components/PermissionDialog";
import ErrorDialog from "@/components/ErrorDialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const MainPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const {
    isCameraActive,
    setCameraActive,
    isProcessing,
    setProcessing,
    isVoiceCommandActive, 
    toggleVoiceCommand,
    setAnalysisResult,
    showError,
    capturedImageUrl,
    setCapturedImageUrl
  } = useAppContext();

  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState({
    message: "",
    type: "error" as "error" | "success"
  });
  const [voiceInstructions, setVoiceInstructions] = useState({
    played: false,
    message: "Say 'take a picture' to describe what's around you. Say 'quit' to return to the welcome screen."
  });
  
  const speechRecognitionRef = useRef<any>(null);
  const [listeningActive, setListeningActive] = useState(false);

  // Start listening for voice commands when component mounts
  useEffect(() => {
    // Show camera permission dialog if camera is not active
    if (!isCameraActive) {
      setPermissionDialogOpen(true);
    }
    
    return () => {
      // Make sure to clean up voice commands when component unmounts
      stopVoiceRecognition();
    };
  }, []);

  // Play voice instructions once camera is active
  useEffect(() => {
    if (isCameraActive && !voiceInstructions.played) {
      speak(voiceInstructions.message)
        .then(() => {
          setVoiceInstructions(prev => ({ ...prev, played: true }));
          // Start listening after instructions are played
          startVoiceRecognition();
        })
        .catch(error => console.error("TTS error:", error));
    }
  }, [isCameraActive, voiceInstructions]);
  
  const startVoiceRecognition = () => {
    const speechRecognition = getSpeechRecognition();
    if (!speechRecognition) {
      showError("Speech recognition is not supported in your browser");
      return;
    }
    
    // Store reference for cleanup
    speechRecognitionRef.current = speechRecognition;
    
    // Make sure any previous instances are stopped
    if (speechRecognition.isListening) {
      speechRecognition.stop();
    }
    
    setListeningActive(true);
    
    speechRecognition.onResult(({ transcript, isFinal }) => {
      if (isFinal) {
        console.log("Recognized speech:", transcript);
        processVoiceCommand(transcript);
      }
    });
    
    speechRecognition.onError((error) => {
      console.error("Speech recognition error:", error);
      // Restart voice recognition after a brief pause
      setTimeout(() => {
        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.start();
          } catch (err) {
            console.error("Failed to restart speech recognition:", err);
          }
        }
      }, 1000);
    });
    
    try {
      speechRecognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setListeningActive(false);
    }
  };
  
  const stopVoiceRecognition = () => {
    if (speechRecognitionRef.current && speechRecognitionRef.current.isListening) {
      speechRecognitionRef.current.stop();
    }
    setListeningActive(false);
  };
  
  const processVoiceCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Custom commands for this page
    if (lowerTranscript.includes("take a picture") || 
        lowerTranscript.includes("take picture") || 
        lowerTranscript.includes("describe surroundings") ||
        lowerTranscript.includes("what's around me")) {
      
      handleVoiceCapture();
    } 
    else if (lowerTranscript.includes("quit") || 
            lowerTranscript.includes("exit") ||
            lowerTranscript.includes("go back") ||
            lowerTranscript.includes("home")) {
      
      speak("Thank you for using NaviSight. Returning to home screen.")
        .then(() => setLocation("/"))
        .catch(error => console.error("TTS error:", error));
    }
    // Process standard commands
    else {
      const command = detectCommand(transcript);
      if (command) {
        handleStandardCommand(command);
      }
    }
  };

  const handleCapture = (imageUrl: string) => {
    setCapturedImageUrl(imageUrl);
    processImage(imageUrl);
  };

  const handleGrantPermission = () => {
    setCameraActive(true);
  };

  const processImage = async (imageUrl: string) => {
    setProcessing(true);
    
    // Temporarily stop listening while processing
    stopVoiceRecognition();
    
    speak("Analyzing your surroundings...")
      .catch(error => console.error("TTS error:", error));
    
    try {
      // Convert base64 image to blob for upload
      const base64Data = imageUrl.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error analyzing image: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      setAnalysisResult({
        sceneDescription: result.scene_description,
        detectedObjects: result.detected_objects.map((obj: any) => ({
          name: obj.name,
          distance: obj.distance
        })),
        warningMessage: result.alert_message
      });
    } catch (error) {
      console.error('Error processing image:', error);
      
      speak("Sorry, I couldn't analyze the image. Please try again.")
        .catch(error => console.error("TTS error:", error));
      
      setErrorInfo({
        message: `Failed to analyze image: ${(error as Error).message}`,
        type: "error"
      });
      setErrorDialogOpen(true);
    } finally {
      setProcessing(false);
      // Resume listening after processing is done
      setTimeout(() => {
        startVoiceRecognition();
      }, 1000);
    }
  };

  const handleVoiceCapture = () => {
    if (!isCameraActive) {
      speak("I need camera permission to take a picture. Please allow camera access.")
        .then(() => setPermissionDialogOpen(true))
        .catch(error => console.error("TTS error:", error));
      return;
    }
    
    if (isProcessing) {
      speak("I'm still processing your last request, please wait.")
        .catch(error => console.error("TTS error:", error));
      return;
    }
    
    // Capture image from video
    const videoElement = document.querySelector('video');
    if (videoElement) {
      try {
        const imageUrl = captureImageFromVideo(videoElement);
        handleCapture(imageUrl);
      } catch (error) {
        console.error("Error capturing image:", error);
        speak("I couldn't take a picture. Please try again.")
          .catch(error => console.error("TTS error:", error));
      }
    }
  };

  const handleStandardCommand = (command: string) => {
    switch (command) {
      case "DESCRIBE_SURROUNDINGS":
        handleVoiceCapture();
        break;
      case "STOP_LISTENING":
        stopVoiceRecognition();
        speak("Voice commands turned off.")
          .catch(error => console.error("TTS error:", error));
        break;
      case "OPEN_SETTINGS":
        speak("Opening settings.")
          .then(() => setLocation("/settings"))
          .catch(error => console.error("TTS error:", error));
        break;
      case "OPEN_HELP":
        speak("Opening help.")
          .then(() => setLocation("/help"))
          .catch(error => console.error("TTS error:", error));
        break;
      case "GO_HOME":
        speak("Returning to welcome screen.")
          .then(() => setLocation("/"))
          .catch(error => console.error("TTS error:", error));
        break;
      default:
        break;
    }
  };

  const handleHomeClick = () => {
    speak("Returning to welcome screen.")
      .then(() => setLocation("/"))
      .catch(error => console.error("TTS error:", error));
  };

  const handleSettingsClick = () => {
    speak("Opening settings.")
      .then(() => setLocation("/settings"))
      .catch(error => console.error("TTS error:", error));
  };

  const handleHelpClick = () => {
    speak("Opening help.")
      .then(() => setLocation("/help"))
      .catch(error => console.error("TTS error:", error));
  };

  const toggleVoiceListener = () => {
    if (listeningActive) {
      stopVoiceRecognition();
      speak("Voice commands turned off.")
        .catch(error => console.error("TTS error:", error));
    } else {
      startVoiceRecognition();
      speak("Voice commands turned on. Say 'take a picture' to describe what's around you.")
        .catch(error => console.error("TTS error:", error));
    }
  };

  const handleManualCapture = () => {
    if (isProcessing) return;
    
    if (!isCameraActive) {
      setPermissionDialogOpen(true);
      return;
    }
    
    speak("Taking a picture now.")
      .then(() => {
        // Capture image from video
        const videoElement = document.querySelector('video');
        if (videoElement) {
          try {
            const imageUrl = captureImageFromVideo(videoElement);
            handleCapture(imageUrl);
          } catch (error) {
            console.error("Error capturing image:", error);
          }
        }
      })
      .catch(error => console.error("TTS error:", error));
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between min-h-screen p-4 pb-24">
        <ThemeToggle />
        
        <header className="w-full flex flex-col items-center justify-center py-6">
          <h1 className="text-3xl font-bold text-primary mb-2">NaviSight</h1>
          <div className="flex items-center mb-4">
            <span 
              className={`h-3 w-3 rounded-full mr-3 ${
                listeningActive 
                  ? "bg-success animate-pulse" 
                  : "bg-destructive"
              }`}
              aria-hidden="true"
            />
            <p className="text-lg">
              {listeningActive
                ? "Listening for voice commands..."
                : "Voice commands inactive"}
            </p>
          </div>
          
          {!voiceInstructions.played && (
            <div className="flex items-center mt-2">
              <span className="h-3 w-3 bg-primary animate-pulse rounded-full mr-2"></span>
              <p>Loading voice instructions...</p>
            </div>
          )}
        </header>
        
        <CameraView onCapture={handleCapture} />
        
        <div className="w-full max-w-md mb-6 flex flex-col gap-3">
          <Button 
            className="bg-primary text-white py-6 text-xl"
            onClick={handleManualCapture}
            disabled={isProcessing}
          >
            <Camera className="mr-2 h-6 w-6" />
            Take Picture
          </Button>
          
          <Button 
            variant={listeningActive ? "destructive" : "outline"}
            className="py-4 text-lg"
            onClick={toggleVoiceListener}
          >
            {listeningActive 
              ? "Turn Off Voice Commands" 
              : "Turn On Voice Commands"}
          </Button>
        </div>
        
        <div className="w-full max-w-md mb-6 bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Voice Commands:</h2>
          <ul className="list-disc pl-6">
            <li className="text-lg mb-2">"Take a picture" - Describe surroundings</li>
            <li className="text-lg mb-2">"What's around me" - Analyze scene</li>
            <li className="text-lg">{"\"Quit\" or \"Exit\""} - Return to home</li>
          </ul>
        </div>
        
        <DescriptionOutput />
      </div>
      
      <BottomNavigation 
        onHomeClick={handleHomeClick}
        onSettingsClick={handleSettingsClick}
        onHelpClick={handleHelpClick}
      />
      
      <PermissionDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        onGrantPermission={handleGrantPermission}
      />
      
      <ErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        message={errorInfo.message}
        type={errorInfo.type}
      />
    </>
  );
};

export default MainPage;