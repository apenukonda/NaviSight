import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAppContext } from "@/contexts/AppContext";

import ThemeToggle from "@/components/ThemeToggle";
import CameraView from "@/components/CameraView";
import VoiceCommandStatus from "@/components/VoiceCommandStatus";
import DescriptionOutput from "@/components/DescriptionOutput";
import MainActionButtons from "@/components/MainActionButtons";
import BottomNavigation from "@/components/BottomNavigation";
import PermissionDialog from "@/components/PermissionDialog";
import ErrorDialog from "@/components/ErrorDialog";

const Home: React.FC = () => {
  const [, setLocation] = useLocation();
  const {
    isCameraActive,
    setCameraActive,
    isProcessing,
    setProcessing,
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

  useEffect(() => {
    // Show camera permission dialog on first load
    if (!isCameraActive) {
      setTimeout(() => {
        setPermissionDialogOpen(true);
      }, 1000);
    }
  }, []);

  const handleCapture = (imageUrl: string) => {
    setCapturedImageUrl(imageUrl);
    processImage(imageUrl);
  };

  const handleDescribeClick = () => {
    if (!isCameraActive) {
      setPermissionDialogOpen(true);
      return;
    }
  };

  const handleGrantPermission = () => {
    setCameraActive(true);
  };

  const processImage = async (imageUrl: string) => {
    setProcessing(true);
    
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
      setErrorInfo({
        message: `Failed to analyze image: ${(error as Error).message}`,
        type: "error"
      });
      setErrorDialogOpen(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case "DESCRIBE_SURROUNDINGS":
        if (isCameraActive) {
          // Trigger the camera capture
          const videoElement = document.querySelector('video');
          if (videoElement) {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoElement, 0, 0);
              const imageUrl = canvas.toDataURL('image/jpeg');
              handleCapture(imageUrl);
            }
          }
        } else {
          setPermissionDialogOpen(true);
        }
        break;
      case "STOP_LISTENING":
        // This will be handled by the VoiceCommandStatus component
        break;
      case "OPEN_SETTINGS":
        setLocation("/settings");
        break;
      case "OPEN_HELP":
        setLocation("/help");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between min-h-screen p-4 pb-24">
        <ThemeToggle />
        
        <header className="w-full flex flex-col items-center justify-center py-6">
          <h1 className="text-3xl font-bold text-primary mb-2">NaviSight</h1>
          <p className="text-lg text-center mb-4">Navigation Assistant for Visually Impaired</p>
        </header>
        
        <CameraView onCapture={handleCapture} />
        
        <VoiceCommandStatus onCommand={handleVoiceCommand} />
        
        <DescriptionOutput />
        
        <MainActionButtons onDescribeClick={handleDescribeClick} />
      </div>
      
      <BottomNavigation />
      
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

export default Home;
