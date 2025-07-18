type SpeechRecognitionResult = {
  transcript: string;
  isFinal: boolean;
};

type SpeechRecognitionHandler = (result: SpeechRecognitionResult) => void;

// Interface to handle different browser implementations
interface ISpeechRecognition {
  start(): void;
  stop(): void;
  isListening: boolean;
  onResult(handler: SpeechRecognitionHandler): void;
  onError(handler: (error: Error) => void): void;
}

class BrowserSpeechRecognition implements ISpeechRecognition {
  private recognition: any;
  private resultHandler: SpeechRecognitionHandler | null = null;
  private errorHandler: ((error: Error) => void) | null = null;
  isListening: boolean = false;

  constructor() {
    // Browser compatibility check
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error("Speech recognition is not supported in this browser");
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.recognition.onresult = (event: any) => {
      if (!this.resultHandler) return;
      
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.trim();
      const isFinal = event.results[lastResultIndex].isFinal;
      
      this.resultHandler({ transcript, isFinal });
    };
    
    this.recognition.onerror = (event: any) => {
      if (this.errorHandler) {
        this.errorHandler(new Error(`Speech recognition error: ${event.error}`));
      }
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
    };
  }
  
  start(): void {
    if (this.isListening) return;
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error as Error);
      }
    }
  }
  
  stop(): void {
    if (!this.isListening) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error as Error);
      }
    }
  }
  
  onResult(handler: SpeechRecognitionHandler): void {
    this.resultHandler = handler;
  }
  
  onError(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }
}

// Command detection for specific phrases
export function detectCommand(transcript: string): string | null {
  const lowerTranscript = transcript.toLowerCase();
  
  if (lowerTranscript.includes("where am i") || 
      lowerTranscript.includes("what is nearby") || 
      lowerTranscript.includes("describe surroundings") ||
      lowerTranscript.includes("describe my surroundings") ||
      lowerTranscript.includes("what's around me") ||
      lowerTranscript.includes("what is around me") ||
      lowerTranscript.includes("take a picture") ||
      lowerTranscript.includes("take picture")) {
    return "DESCRIBE_SURROUNDINGS";
  }
  
  if (lowerTranscript.includes("stop listening") || 
      lowerTranscript.includes("turn off voice") ||
      lowerTranscript.includes("disable voice")) {
    return "STOP_LISTENING";
  }
  
  if (lowerTranscript.includes("open settings") || 
      lowerTranscript.includes("go to settings") ||
      lowerTranscript.includes("show settings") ||
      lowerTranscript.includes("settings")) {
    return "OPEN_SETTINGS";
  }
  
  if (lowerTranscript.includes("help") || 
      lowerTranscript.includes("show help") ||
      lowerTranscript.includes("instructions")) {
    return "OPEN_HELP";
  }
  
  if (lowerTranscript.includes("quit") ||
      lowerTranscript.includes("exit") ||
      lowerTranscript.includes("go back") ||
      lowerTranscript.includes("home") ||
      lowerTranscript.includes("main menu")) {
    return "GO_HOME";
  }
  
  if (lowerTranscript.includes("yes") ||
      lowerTranscript.includes("continue") ||
      lowerTranscript.includes("proceed") ||
      lowerTranscript.includes("start")) {
    return "CONFIRM";
  }
  
  return null;
}

// Export a singleton instance to be used across the app
let speechRecognitionInstance: ISpeechRecognition | null = null;

export function getSpeechRecognition(): ISpeechRecognition | null {
  if (!speechRecognitionInstance) {
    try {
      speechRecognitionInstance = new BrowserSpeechRecognition();
    } catch (error) {
      console.error("Failed to initialize speech recognition:", error);
      return null;
    }
  }
  
  return speechRecognitionInstance;
}
