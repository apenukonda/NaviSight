type TTSOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
};

const DEFAULT_OPTIONS: TTSOptions = {
  rate: 1,
  pitch: 1,
  volume: 1,
};

// Check if speech synthesis is supported
export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

// Get all available voices
export const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }
    
    // If voices are already loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // Otherwise wait for voices to be loaded
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
};

// Get a voice by specific criteria (language, name, etc.)
export const findVoice = (criteria: Partial<SpeechSynthesisVoice>): Promise<SpeechSynthesisVoice | undefined> => {
  return getVoices().then(voices => {
    return voices.find(voice => {
      for (const [key, value] of Object.entries(criteria)) {
        if ((voice as any)[key] !== value) {
          return false;
        }
      }
      return true;
    });
  });
};

// Main TTS function
export const speak = (text: string, options: TTSOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported()) {
      const error = new Error('Speech synthesis is not supported in this browser');
      if (options.onError) options.onError(error);
      reject(error);
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Merge with default options
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = mergedOptions.rate || 1;
    utterance.pitch = mergedOptions.pitch || 1;
    utterance.volume = mergedOptions.volume || 1;
    
    if (mergedOptions.voice) {
      utterance.voice = mergedOptions.voice;
    }
    
    utterance.onstart = () => {
      if (mergedOptions.onStart) mergedOptions.onStart();
    };
    
    utterance.onend = () => {
      if (mergedOptions.onEnd) mergedOptions.onEnd();
      resolve();
    };
    
    utterance.onerror = (event) => {
      const error = new Error(`Speech synthesis error: ${event.error}`);
      if (mergedOptions.onError) mergedOptions.onError(error);
      reject(error);
    };
    
    window.speechSynthesis.speak(utterance);
  });
};

// Helper function to speak the scene analysis result
export const speakAnalysisResult = (
  sceneDescription: string, 
  detectedObjects: { name: string, distance: string }[],
  warningMessage?: string,
  options: TTSOptions = {}
): Promise<void> => {
  let fullText = `Scene description: ${sceneDescription}. `;
  
  if (detectedObjects.length > 0) {
    fullText += "Detected objects: ";
    fullText += detectedObjects.map(obj => `${obj.name} at ${obj.distance}`).join(", ") + ". ";
  }
  
  if (warningMessage) {
    fullText += `Warning: ${warningMessage}`;
  }
  
  return speak(fullText, options);
};
