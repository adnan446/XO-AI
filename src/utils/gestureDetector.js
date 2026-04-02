export const calculateDistance = (lm1, lm2) => {
  return Math.sqrt(
    Math.pow(lm1.x - lm2.x, 2) +
    Math.pow(lm1.y - lm2.y, 2) +
    Math.pow(lm1.z - lm2.z, 2)
  );
};

export const isGunGesture = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const wrist = landmarks[0];

  // Helper to check if a finger is extended
  const isExtended = (tipIdx, pipIdx) => {
    return calculateDistance(landmarks[tipIdx], wrist) > calculateDistance(landmarks[pipIdx], wrist);
  };

  const indexExtended = isExtended(8, 6);
  const middleExtended = isExtended(12, 10);
  const ringFolded = !isExtended(16, 14);
  const pinkyFolded = !isExtended(20, 18);

  return indexExtended && middleExtended && ringFolded && pinkyFolded;
};

let previousThumbDistance = Infinity;
let triggerPulled = false;

export const detectTrigger = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  // Thumb tip is 4, Index base is 5
  const thumbTip = landmarks[4];
  const indexBase = landmarks[5];
  
  const currentDis = calculateDistance(thumbTip, indexBase);
  
  // Threshold for trigger pull might need tuning based on z-depth and hand size.
  // We use a relatively small local distance.
  const triggerThreshold = 0.10; 
  const releaseThreshold = 0.15;

  let justFired = false;

  if (currentDis < triggerThreshold && !triggerPulled) {
    triggerPulled = true;
    justFired = true;
  } else if (currentDis > releaseThreshold) {
    triggerPulled = false;
  }

  previousThumbDistance = currentDis;

  return justFired;
};
