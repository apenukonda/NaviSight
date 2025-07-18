import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

type Settings = {
  speechRate: number;
  voiceType: string;
  cameraType: string;
  flashEnabled: boolean;
  highContrastMode: boolean;
  vibrationEnabled: boolean;
  vibrationIntensity: number;
};

type AnalysisResult = {
  sceneDescription: string;
  detectedObjects: Array<{
    name: string;
    distance: string;
  }>;
  warningMessage?: string;
};

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isVoiceCommandActive: boolean;
  toggleVoiceCommand: () => void;
  isCameraActive: boolean;
  setCameraActive: (active: boolean) => void;
  isProcessing: boolean;
  setProcessing: (processing: boolean) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  showError: (message: string, type?: "error" | "success") => void;
  capturedImageUrl: string | null;
  setCapturedImageUrl: (url: string | null) => void;
}

const defaultSettings: Settings = {
  speechRate: 1,
  voiceType: "default",
  cameraType: "back",
  flashEnabled: false,
  highContrastMode: false,
  vibrationEnabled: true,
  vibrationIntensity: 60,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [isVoiceCommandActive, setIsVoiceCommandActive] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Apply dark mode to the document
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    if ("vibrate" in navigator && settings.vibrationEnabled) {
      navigator.vibrate(50);
    }
  };

  const toggleVoiceCommand = () => {
    setIsVoiceCommandActive((prev) => !prev);
    if ("vibrate" in navigator && settings.vibrationEnabled) {
      navigator.vibrate(100);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const showError = (message: string, type: "error" | "success" = "error") => {
    toast({
      title: type === "error" ? "Error" : "Success",
      description: message,
      variant: type === "error" ? "destructive" : "default",
    });
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        isVoiceCommandActive,
        toggleVoiceCommand,
        isCameraActive,
        setCameraActive: setIsCameraActive,
        isProcessing,
        setProcessing: setIsProcessing,
        analysisResult,
        setAnalysisResult,
        settings,
        updateSettings,
        showError,
        capturedImageUrl,
        setCapturedImageUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
