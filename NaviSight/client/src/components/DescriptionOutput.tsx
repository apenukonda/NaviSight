import React, { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AlertTriangle } from "lucide-react";
import { speakAnalysisResult } from "@/lib/textToSpeech";

const DescriptionOutput: React.FC = () => {
  const { analysisResult, settings } = useAppContext();

  useEffect(() => {
    if (analysisResult) {
      speakAnalysisResult(
        analysisResult.sceneDescription,
        analysisResult.detectedObjects,
        analysisResult.warningMessage,
        { rate: settings.speechRate }
      ).catch(error => {
        console.error("TTS error:", error);
      });
    }
  }, [analysisResult]);

  if (!analysisResult) return null;

  return (
    <div className="w-full max-w-md mb-6 bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3">Scene Description:</h2>
      <p className="text-lg mb-4">{analysisResult.sceneDescription}</p>
      
      {analysisResult.detectedObjects.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2">Detected Objects:</h3>
          <ul className="list-disc pl-6 mb-4">
            {analysisResult.detectedObjects.map((obj, index) => (
              <li key={index} className="text-lg mb-1">
                {obj.name} ({obj.distance})
              </li>
            ))}
          </ul>
        </>
      )}
      
      {analysisResult.warningMessage && (
        <div className="p-3 bg-secondary/20 dark:bg-secondary/20 border-l-4 border-secondary dark:border-secondary rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-secondary" />
            <p className="text-lg font-medium">{analysisResult.warningMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionOutput;
