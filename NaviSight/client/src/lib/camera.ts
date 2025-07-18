export async function requestCameraAccess(facingMode: "user" | "environment" = "environment"): Promise<MediaStream> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera access is not supported in your browser");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false,
    });
    
    return stream;
  } catch (error) {
    if ((error as Error).name === "NotAllowedError" || (error as Error).name === "PermissionDeniedError") {
      throw new Error("Camera permission denied. Please grant camera access to use this feature.");
    } else if ((error as Error).name === "NotFoundError" || (error as Error).name === "DevicesNotFoundError") {
      throw new Error("No camera found on your device.");
    } else if ((error as Error).name === "NotReadableError" || (error as Error).name === "TrackStartError") {
      throw new Error("Could not access camera. It may be in use by another application.");
    } else if ((error as Error).name === "OverconstrainedError") {
      throw new Error("Could not find a suitable camera. Try a different camera setting.");
    }
    
    throw new Error(`Camera access error: ${(error as Error).message}`);
  }
}

export function captureImageFromVideo(videoElement: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Could not create canvas context for image capture");
  }
  
  ctx.drawImage(videoElement, 0, 0);
  
  // Get base64 image data for easy transfer to server
  return canvas.toDataURL('image/jpeg');
}

export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

export async function getAvailableCameras(): Promise<MediaDeviceInfo[]> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error("Media devices enumeration not supported in this browser");
    }
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === "videoinput");
  } catch (error) {
    console.error("Failed to enumerate devices:", error);
    return [];
  }
}
