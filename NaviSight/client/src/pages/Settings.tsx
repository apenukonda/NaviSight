import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/contexts/AppContext";
import BottomNavigation from "@/components/BottomNavigation";
import { speak } from "@/lib/textToSpeech";
import { getSpeechRecognition } from "@/lib/speechRecognition";

const Settings: React.FC = () => {
  const [, setLocation] = useLocation();
  const { settings, updateSettings, showError, isVoiceCommandActive, toggleVoiceCommand } = useAppContext();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [voicePromptPlayed, setVoicePromptPlayed] = useState(false);

  useEffect(() => {
    // Start listening for voice commands when component mounts
    if (!isVoiceCommandActive) {
      toggleVoiceCommand();
    }

    // Announce settings page with voice
    if (!voicePromptPlayed) {
      speak(
        "Settings page. Adjust speech rate, camera settings, and other preferences. Say 'save' to save changes or 'back' to return."
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
        
        if (lowerTranscript.includes("save") || 
            lowerTranscript.includes("save settings") || 
            lowerTranscript.includes("save changes")) {
          handleSave();
        } 
        else if (lowerTranscript.includes("back") || 
                lowerTranscript.includes("go back") ||
                lowerTranscript.includes("return") ||
                lowerTranscript.includes("cancel")) {
          handleGoBack();
        }
        else if (lowerTranscript.includes("main") || 
                lowerTranscript.includes("camera")) {
          handleMainClick();
        }
        else if (lowerTranscript.includes("help")) {
          handleHelpClick();
        }
      }
    });
  }, [isVoiceCommandActive]);

  const handleSave = () => {
    updateSettings(localSettings);
    speak("Settings saved successfully!")
      .then(() => {
        showError("Settings saved successfully!", "success");
      })
      .catch(error => {
        console.error("TTS error:", error);
      });
  };

  const handleGoBack = () => {
    speak("Going back to welcome screen.")
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

  const handleHelpClick = () => {
    speak("Opening help.")
      .then(() => setLocation("/help"))
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
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-8">
          {/* Voice command status indicator */}
          <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
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
                  ? "Voice commands active: Say 'save' or 'back'"
                  : "Voice commands inactive"}
              </p>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Voice Settings</h2>
            
            <div className="space-y-2">
              <Label htmlFor="speechRate" className="text-lg">Speech Rate: {localSettings.speechRate.toFixed(1)}</Label>
              <Slider
                id="speechRate"
                min={0.5}
                max={2}
                step={0.1}
                value={[localSettings.speechRate]}
                onValueChange={(value) => setLocalSettings({ ...localSettings, speechRate: value[0] })}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="voiceSelector" className="text-lg">Voice</Label>
              <Select 
                value={localSettings.voiceType}
                onValueChange={(value) => setLocalSettings({ ...localSettings, voiceType: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Camera Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Camera Settings</h2>
            
            <div className="space-y-2">
              <Label htmlFor="cameraSelector" className="text-lg">Camera</Label>
              <Select 
                value={localSettings.cameraType}
                onValueChange={(value) => setLocalSettings({ ...localSettings, cameraType: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="back">Back Camera</SelectItem>
                  <SelectItem value="front">Front Camera</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="flashEnabled" className="text-lg">Flash when capturing</Label>
              <Switch
                id="flashEnabled"
                checked={localSettings.flashEnabled}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, flashEnabled: checked })}
              />
            </div>
          </div>
          
          {/* Appearance Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Appearance</h2>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="highContrastMode" className="text-lg">High Contrast Mode</Label>
              <Switch
                id="highContrastMode"
                checked={localSettings.highContrastMode}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, highContrastMode: checked })}
              />
            </div>
          </div>
          
          {/* Haptic Feedback Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Haptic Feedback</h2>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="vibrationEnabled" className="text-lg">Vibration Feedback</Label>
              <Switch
                id="vibrationEnabled"
                checked={localSettings.vibrationEnabled}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, vibrationEnabled: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vibrationIntensity" className="text-lg">
                Vibration Intensity: {localSettings.vibrationIntensity}%
              </Label>
              <Slider
                id="vibrationIntensity"
                min={0}
                max={100}
                step={10}
                disabled={!localSettings.vibrationEnabled}
                value={[localSettings.vibrationIntensity]}
                onValueChange={(value) => setLocalSettings({ ...localSettings, vibrationIntensity: value[0] })}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-6">
          <Button 
            className="w-full bg-primary text-white py-4 text-lg"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
      
      <BottomNavigation 
        onHomeClick={handleGoBack}
        onSettingsClick={() => {}}
        onHelpClick={handleHelpClick}
      />
    </>
  );
};

export default Settings;
