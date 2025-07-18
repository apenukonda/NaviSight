import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for image analysis
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      // Check if image file was provided
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Typically you would send this to an AI vision service like Azure, Google Vision, or AWS Rekognition
      // For now, we'll create a mock response for demonstration
      
      // Analyze the image (mock implementation)
      const analysisResult = await analyzeImage(req.file.buffer);
      
      return res.status(200).json(analysisResult);
    } catch (error) {
      console.error("Error analyzing image:", error);
      return res.status(500).json({ 
        message: "Error analyzing image", 
        details: (error as Error).message 
      });
    }
  });
  
  // Route to save user settings
  app.post("/api/settings", async (req, res) => {
    try {
      const { userId, settings } = req.body;
      
      // In a real app, this would be saved to a database
      // For now, we'll just return success
      
      return res.status(200).json({ message: "Settings saved successfully" });
    } catch (error) {
      console.error("Error saving settings:", error);
      return res.status(500).json({ 
        message: "Error saving settings", 
        details: (error as Error).message 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

// Mock function to analyze an image
// In a real implementation, this would call a computer vision API
async function analyzeImage(imageBuffer: Buffer) {
  // In production, this would make an API call to a computer vision service
  // For demonstration, we'll return mock data
  
  // Mock API response
  const mockObjects = [
    { name: "Table", distance: "3 feet ahead" },
    { name: "Chair", distance: "2 feet to the left" },
    { name: "Doorway", distance: "6 feet ahead" },
    { name: "Window", distance: "5 feet to the right" }
  ];
  
  // Randomize which objects to include
  const selectedObjects = mockObjects.filter(() => Math.random() > 0.3);
  
  // Mock scene descriptions
  const sceneDescriptions = [
    "You are in what appears to be a living room. There's a pathway ahead leading to a doorway.",
    "This looks like a kitchen area with countertops and appliances. There's open space to move ahead.",
    "You're in a hallway with doors on either side. The path continues straight ahead.",
    "This is an office space with a desk and chair. There's room to navigate around the furniture."
  ];
  
  const randomDescriptionIndex = Math.floor(Math.random() * sceneDescriptions.length);
  
  // Determine if there should be a warning
  const shouldHaveWarning = Math.random() > 0.5;
  
  const warnings = [
    "Caution: Table edge is close to your right.",
    "Be careful: There appears to be a step down ahead.",
    "Warning: Low hanging object detected overhead.",
    "Attention: Narrow passage ahead, proceed slowly."
  ];
  
  const randomWarningIndex = Math.floor(Math.random() * warnings.length);
  
  return {
    scene_description: sceneDescriptions[randomDescriptionIndex],
    detected_objects: selectedObjects,
    alert_message: shouldHaveWarning ? warnings[randomWarningIndex] : null
  };
}
