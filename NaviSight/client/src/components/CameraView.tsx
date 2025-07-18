import React, { useRef, useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Camera, LoaderCircle } from "lucide-react";
import { requestCameraAccess, captureImageFromVideo, stopMediaStream } from "@/lib/camera";

interface CameraViewProps {
  onCapture: (imageUrl: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const { 
    isCameraActive, 
    setCameraActive, 
    isProcessing,
    settings 
  } = useAppContext();
  
  useEffect(() => {
    // Cleanup function to stop the camera stream when component unmounts
    return () => {
      if (stream) {
        stopMediaStream(stream);
      }
    };
  }, [stream]);

  useEffect(() => {
    // Start or stop camera based on isCameraActive state
    if (isCameraActive && !stream) {
      startCamera();
    } else if (!isCameraActive && stream) {
      stopCamera();
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const facingMode = settings.cameraType === "front" ? "user" : "environment";
      const newStream = await requestCameraAccess(facingMode);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      
      setStream(newStream);
      setCameraActive(true);
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  };

  const handleCaptureClick = () => {
    if (isProcessing) return;
    
    if (!isCameraActive) {
      startCamera();
      return;
    }
    
    if (videoRef.current) {
      try {
        const imageUrl = captureImageFromVideo(videoRef.current);
        onCapture(imageUrl);
        
        // Optional: provide haptic feedback when taking a picture
        if ("vibrate" in navigator && settings.vibrationEnabled) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch (error) {
        console.error("Error capturing image:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-md aspect-[3/4] bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg overflow-hidden mb-6 relative">
      {!isCameraActive && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Camera className="h-16 w-16 mb-4 text-foreground/50" />
          <p className="text-lg text-foreground/70 text-center px-4">
            Camera preview will appear here
          </p>
        </div>
      )}
      
      <video 
        ref={videoRef} 
        className={`w-full h-full object-cover ${isCameraActive ? "block" : "hidden"}`} 
        playsInline
      />
      
      {isProcessing && (
        <div className="absolute inset-0 bg-background/70 dark:bg-background/70 flex flex-col items-center justify-center">
          <LoaderCircle className="w-16 h-16 animate-spin mb-4 text-primary" />
          <p className="text-lg text-foreground font-medium">Processing image...</p>
        </div>
      )}
      
      <button
        onClick={handleCaptureClick}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary dark:bg-primary flex items-center justify-center cursor-pointer shadow-lg"
        aria-label="Capture image"
        disabled={isProcessing}
      >
        <Camera className="h-8 w-8 text-white" />
      </button>
    </div>
  );
};

export default CameraView;
