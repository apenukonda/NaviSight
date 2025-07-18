import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { X, Volume2, Camera, Zap } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const { settings, updateSettings, showError } = useAppContext();
  const [localSettings, setLocalSettings] = useState({ ...settings });

  useEffect(() => {
    // Reset local settings when the modal opens
    if (open) {
      setLocalSettings({ ...settings });
    }
  }, [open, settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    showError("Settings saved successfully!", "success");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-6 mt-2">
          {/* Voice Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Voice Settings</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="speechRate" className="text-lg">Speech Rate</Label>
              <div className="flex items-center w-32">
                <Volume2 className="h-5 w-5 mr-2 text-foreground/70" />
                <Slider
                  id="speechRate"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[localSettings.speechRate]}
                  onValueChange={(value) => setLocalSettings({ ...localSettings, speechRate: value[0] })}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="voiceSelector" className="text-lg">Voice</Label>
              <Select 
                value={localSettings.voiceType}
                onValueChange={(value) => setLocalSettings({ ...localSettings, voiceType: value })}
              >
                <SelectTrigger className="w-32">
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
            <h3 className="text-xl font-semibold">Camera Settings</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="cameraSelector" className="text-lg">Camera</Label>
              <Select 
                value={localSettings.cameraType}
                onValueChange={(value) => setLocalSettings({ ...localSettings, cameraType: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="back">Back Camera</SelectItem>
                  <SelectItem value="front">Front Camera</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg">Flash when capturing</span>
              <Switch
                checked={localSettings.flashEnabled}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, flashEnabled: checked })}
              />
            </div>
          </div>
          
          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Appearance</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-lg">High Contrast Mode</span>
              <Switch
                checked={localSettings.highContrastMode}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, highContrastMode: checked })}
              />
            </div>
          </div>
          
          {/* Vibration/Haptic Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Haptic Feedback</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-lg">Vibration Feedback</span>
              <Switch
                checked={localSettings.vibrationEnabled}
                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, vibrationEnabled: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg">Vibration Intensity</span>
              <div className="flex items-center w-32">
                <Zap className="h-5 w-5 mr-2 text-foreground/70" />
                <Slider
                  id="vibrationIntensity"
                  min={0}
                  max={100}
                  step={10}
                  disabled={!localSettings.vibrationEnabled}
                  value={[localSettings.vibrationIntensity]}
                  onValueChange={(value) => setLocalSettings({ ...localSettings, vibrationIntensity: value[0] })}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            className="bg-primary text-white"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
