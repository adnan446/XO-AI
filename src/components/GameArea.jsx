import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { GameState } from '../utils/gameLogic';

const GameArea = ({ onScoreChange, onLivesChange, gameStateRef }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const landmarkerRef = useRef(null);
  const gameRef = useRef(null);
  const smoothedCrosshair = useRef(null);

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
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        if (!active) return;
        landmarkerRef.current = landmarker;

        // Setup Webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 60 } }
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
      const vid = videoRef.current;
      if (vid && vid.srcObject) {
         vid.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    // High-resolution canvas rendering
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        if (gameRef.current) {
          gameRef.current.resize(window.innerWidth, window.innerHeight);
        }
      }
    };
    window.addEventListener('resize', handleResize);

    gameRef.current = new GameState(
      canvas.width, 
      canvas.height, 
      (points, combo) => onScoreChange(points, combo),
      () => onLivesChange(-1) // miss
    );
    gameStateRef.current = gameRef.current;

    const rawLandmark = { current: null };
    const handVisible = { current: false };
    const aiRafRef = { current: null };
    const renderRafRef = { current: null };
    const lastFrameTime = { current: performance.now() };

    const aiLoop = () => {
      if (landmarkerRef.current && video.readyState >= 2) {
        const results = landmarkerRef.current.detectForVideo(video, performance.now());
        if (results.landmarks && results.landmarks[0]) {
          const tip = results.landmarks[0][8];
          const mid = results.landmarks[0][7];
          
          const vx = tip.x - mid.x;
          const vy = tip.y - mid.y;
          
          const predictedX = (1 - (tip.x + vx * 0.5)) * canvas.width;
          const predictedY = (tip.y + vy * 0.5) * canvas.height;

          rawLandmark.current = { x: predictedX, y: predictedY };
          handVisible.current = true;
        } else {
          handVisible.current = false;
        }
      }
      aiRafRef.current = requestAnimationFrame(aiLoop);
    };

    const renderLoop = (timestamp) => {
      const deltaMs = timestamp - lastFrameTime.current;
      lastFrameTime.current = timestamp;

      if (handVisible.current && rawLandmark.current) {
        if (!smoothedCrosshair.current) {
          smoothedCrosshair.current = { ...rawLandmark.current };
        } else {
          const safeDelta = Math.min(Math.max(deltaMs, 1), 100);
          const factor = 1 - Math.pow(0.15, safeDelta / 16.666);
          smoothedCrosshair.current.x += (rawLandmark.current.x - smoothedCrosshair.current.x) * factor;
          smoothedCrosshair.current.y += (rawLandmark.current.y - smoothedCrosshair.current.y) * factor;
        }
      } else {
        smoothedCrosshair.current = null;
      }

      const cx = smoothedCrosshair.current?.x ?? null;
      const cy = smoothedCrosshair.current?.y ?? null;

      if (gameRef.current) {
        gameRef.current.updateAndDraw(ctx, cx, cy, handVisible.current, deltaMs);
      }

      renderRafRef.current = requestAnimationFrame(renderLoop);
    };

    aiRafRef.current = requestAnimationFrame(aiLoop);
    renderRafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(aiRafRef.current);
      cancelAnimationFrame(renderRafRef.current);
    };
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
           style={{ willChange: 'transform', transform: 'translateZ(0)' }}
         />
      </div>
    </div>
  );
};

export default GameArea;
