import React from "react";
import { useLocation } from "wouter";
import { Home, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  onHomeClick: () => void;
  onSettingsClick: () => void;
  onHelpClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  onHomeClick, 
  onSettingsClick, 
  onHelpClick 
}) => {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-foreground/10 dark:border-foreground/10 flex justify-around items-center py-2 px-4 shadow-lg">
      <Button
        variant="ghost"
        onClick={onHomeClick}
        className={`nav-button flex flex-col items-center justify-center p-2 rounded-lg ${
          location === "/" 
            ? "bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary" 
            : "text-foreground/70 dark:text-foreground/70"
        }`}
        aria-label="Home"
        aria-current={location === "/" ? "page" : undefined}
      >
        <Home className="h-7 w-7" />
        <span className="text-sm mt-1 font-medium">Home</span>
      </Button>
      
      <Button
        variant="ghost"
        onClick={onSettingsClick}
        className={`nav-button flex flex-col items-center justify-center p-2 rounded-lg ${
          location === "/settings" 
            ? "bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary" 
            : "text-foreground/70 dark:text-foreground/70"
        }`}
        aria-label="Settings"
        aria-current={location === "/settings" ? "page" : undefined}
      >
        <Settings className="h-7 w-7" />
        <span className="text-sm mt-1 font-medium">Settings</span>
      </Button>
      
      <Button
        variant="ghost"
        onClick={onHelpClick}
        className={`nav-button flex flex-col items-center justify-center p-2 rounded-lg ${
          location === "/help" 
            ? "bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary" 
            : "text-foreground/70 dark:text-foreground/70"
        }`}
        aria-label="Help"
        aria-current={location === "/help" ? "page" : undefined}
      >
        <HelpCircle className="h-7 w-7" />
        <span className="text-sm mt-1 font-medium">Help</span>
      </Button>
    </nav>
  );
};

export default BottomNavigation;
