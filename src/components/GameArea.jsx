import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { GameState } from '../utils/gameLogic';
import { isGunGesture, detectTrigger } from '../utils/gestureDetector';

const GameArea = ({ onScoreChange, onLivesChange, gameStateRef }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const requestRef = useRef(null);
  const landmarkerRef = useRef(null);
  const gameRef = useRef(null);
  const smoothedCrosshair = useRef(null);

  const targetCrosshair = useRef(null);

  useEffect(() => {
    let active = true;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        if (!active) return;
        landmarkerRef.current = landmarker;

        // Setup Webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 1280, height: 720 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
             if (active) setIsLoaded(true);
          });
        }
      } catch (err) {
        console.error("Setup Error:", err);
        if (err.name === 'NotReadableError') {
          setError("Webcam access denied: Device is already in use by another application (like Zoom or another browser tab).");
        } else if (err.name === 'NotAllowedError') {
          setError("Webcam access denied: Please grant camera permissions in your browser settings.");
        } else {
          setError(`Failed to access camera or load models. Error: ${err.message || err.name}`);
        }
      }
    };

    setup();

    return () => {
      active = false;
      if (videoRef.current && videoRef.current.srcObject) {
         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    // Fixed canvas size for rendering consistency
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    gameRef.current = new GameState(
      canvas.width, 
      canvas.height, 
      (score, combo) => onScoreChange(score, combo),
      () => onLivesChange(-1) // miss
    );
    gameStateRef.current = gameRef.current;

    let lastVideoTime = -1;

    const loop = (now) => {
      
      // 1. Process new video frame data to set targets
      if (landmarkerRef.current && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const results = landmarkerRef.current.detectForVideo(video, performance.now());
        
        if (results.landmarks && results.landmarks.length > 0) {
          landmarkerRef.current.lastHands = results.landmarks[0];
          const indexFinger = landmarkerRef.current.lastHands[8];
          
          targetCrosshair.current = {
            x: (1 - indexFinger.x) * canvas.width,
            y: indexFinger.y * canvas.height
          };
        } else {
          landmarkerRef.current.lastHands = null;
          targetCrosshair.current = null;
        }
      }

      // 2. Instant tracking with no artificial delay
      if (targetCrosshair.current) {
         if (!smoothedCrosshair.current) {
            smoothedCrosshair.current = { ...targetCrosshair.current };
         } else {
            // Very light smoothing just to prevent micro-jitter, but fast enough to feel instantaneous (0.85)
            smoothedCrosshair.current.x += (targetCrosshair.current.x - smoothedCrosshair.current.x) * 0.85;
            smoothedCrosshair.current.y += (targetCrosshair.current.y - smoothedCrosshair.current.y) * 0.85;
         }
      } else {
         smoothedCrosshair.current = null; // No hand
      }

      // 3. Draw game
      gameRef.current.updateAndDraw(ctx, now, smoothedCrosshair.current, landmarkerRef.current?.lastHands);

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(requestRef.current);
  }, [isLoaded, onScoreChange, onLivesChange, gameStateRef]);

  return (
    <div className="relative w-full h-full flex justify-center items-center overflow-hidden bg-slate-900">
      
      {/* Dynamic Ninja Dojo Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-90 z-0"></div>
      
      {error && <div className="absolute z-50 text-red-500 font-bold text-2xl bg-black p-4 rounded">{error}</div>}
      {!isLoaded && !error && <div className="absolute z-50 text-white font-bold text-2xl animate-pulse">Loading AI Models & Camera...</div>}
      
      {/* Container to scale canvas keeping aspect ratio */}
      <div className="relative w-full h-full flex justify-center items-center overflow-hidden z-10">
         {/* We keep the video rendered to ensure browser decodes it, but make it visually invisible */}
         <video 
           ref={videoRef}
           autoPlay playsInline muted
           className="absolute w-full h-full object-cover scale-x-[-1] opacity-0"
         />
         <canvas
           ref={canvasRef}
           className="absolute w-full h-full object-cover pointer-events-none"
         />
      </div>
    </div>
  );
};

export default GameArea;
