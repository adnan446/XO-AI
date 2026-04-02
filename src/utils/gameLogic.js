class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.life = 1.0;
    this.decay = Math.random() * 0.05 + 0.02;
    this.color = color;
    this.size = Math.random() * 6 + 2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // gravity
    this.life -= this.decay;
  }
  draw(ctx) {
    if (this.life <= 0) return;
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

class TargetHalf {
  constructor(x, y, vx, vy, size, isLeft) {
    this.x = x;
    this.y = y;
    // push halves apart
    this.vx = vx + (isLeft ? -3 : 3) + (Math.random() - 0.5) * 2;
    this.vy = vy - 2 + (Math.random() - 0.5) * 2;
    this.size = size;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.isLeft = isLeft;
    this.gravity = 0.4;
  }
  update(canvasHeight) {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.rotation += this.rotationSpeed;
    return this.y > canvasHeight + this.size * 2; // true if offscreen
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw half apple
    ctx.fillStyle = '#ef4444'; // red outer
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, this.isLeft ? Math.PI / 2 : -Math.PI / 2, this.isLeft ? -Math.PI / 2 : Math.PI / 2);
    ctx.fill();
    
    // Core
    ctx.fillStyle = '#fef08a'; // yellow interior
    ctx.beginPath();
    ctx.arc(this.isLeft ? 2 : -2, 0, this.size / 2 - 4, this.isLeft ? Math.PI / 2 : -Math.PI / 2, this.isLeft ? -Math.PI / 2 : Math.PI / 2);
    ctx.fill();

    ctx.restore();
  }
}

export class Target {
  constructor(canvasWidth, canvasHeight, speedMultiplier = 1) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.size = 50 + Math.random() * 30; // 50 to 80
    
    // Spawn from the bottom, random horizontal position
    this.x = canvasWidth * 0.2 + (Math.random() * canvasWidth * 0.6);
    this.y = canvasHeight + this.size;
    
    // Floatier physics: carefully calculate jump height based on canvas height
    // We want the fruit to reach ~70% to 90% of the screen height. 
    // peakHeight = (vy^2) / (2 * g)
    const g = 0.18 * speedMultiplier;
    const targetPeak = canvasHeight * (0.6 + Math.random() * 0.3); 
    const requiredVy = Math.sqrt(targetPeak * 2 * g);

    const baseVy = -requiredVy; 
    const centerDist = (canvasWidth / 2) - this.x;
    const baseVx = (centerDist / canvasWidth) * 8 + (Math.random() - 0.5) * 3;
    
    this.vx = baseVx;
    this.vy = baseVy;
    this.gravity = g;
    
    this.active = true;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity; 
    this.rotation += this.rotationSpeed;

    if (this.y > this.canvasHeight + this.size * 2 && this.vy > 0) {
      this.active = false;
      return "miss";
    }
    return "active";
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw an apple
    ctx.fillStyle = '#ef4444'; // red
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(-this.size/6, -this.size/6, this.size / 4, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#65a30d'; // green
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -this.size / 2);
    ctx.quadraticCurveTo(10, -this.size / 2 - 15, 20, -this.size / 2 - 10);
    ctx.stroke();

    ctx.restore();
  }
}

export class GameState {
  constructor(width, height, onScore, onMiss) {
    this.width = width;
    this.height = height;
    this.targets = [];
    this.halves = [];
    this.particles = [];
    this.trail = [];
    this.onScore = onScore;
    this.onMiss = onMiss;
    this.score = 0;
    this.combo = 0;
    this.lastSpawnTime = 0;
    this.spawnInterval = 1500;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  spawnTarget(now) {
    if (now - this.lastSpawnTime > this.spawnInterval) {
      // Gentle difficulty scaling
      const speedMultiplier = 1 + (this.score * 0.003);
      const count = 1 + Math.floor(Math.random() * 3); // 1 to 3 targets
      for (let i = 0; i < count; i++) {
         this.targets.push(new Target(this.width, this.height, speedMultiplier));
      }
      this.lastSpawnTime = now;
      this.spawnInterval = Math.max(600, 2000 - this.score * 15);
    }
  }

  distToSegmentSq(p, v, w) {
    const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    if (l2 === 0) return Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2);
  }

  createSliceEffect(target) {
    // Spawn two halves
    this.halves.push(new TargetHalf(target.x, target.y, target.vx, target.vy, target.size, true));
    this.halves.push(new TargetHalf(target.x, target.y, target.vx, target.vy, target.size, false));
    
    // Spawn juice particles
    for (let i = 0; i < 15; i++) {
       this.particles.push(new Particle(target.x, target.y, '#fef08a'));
       this.particles.push(new Particle(target.x, target.y, '#ef4444'));
    }
  }

  checkCollisions() {
    let slicedCount = 0;
    if (this.trail.length < 2) return;

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const bird = this.targets[i];
      if (!bird.active) continue;
      
      let sliced = false;
      for (let j = 0; j < this.trail.length - 1; j++) {
        const p1 = this.trail[j];
        const p2 = this.trail[j+1];
        
        const distSq = this.distToSegmentSq(bird, p1, p2);
        const radiusSq = Math.pow(bird.size / 2 + 15, 2); 
        
        if (distSq <= radiusSq) {
          sliced = true;
          break; 
        }
      }

      if (sliced) {
        bird.active = false;
        slicedCount++;
        this.createSliceEffect(bird);
        this.targets.splice(i, 1);
      }
    }

    if (slicedCount > 0) {
       this.combo += slicedCount;
       this.score += 10 * this.combo;
       this.onScore(this.score, this.combo);
    } else if (this.trail.length === 0) {
       // Reset combo if you stop swiping? For now keep it simple, combo resets on miss.
    }
  }

  updateAndDraw(ctx, now, crosshairPos, hands) {
    ctx.clearRect(0, 0, this.width, this.height);

    // Update Blade Trail
    if (crosshairPos) {
       this.trail.push({ ...crosshairPos, age: 0 });
    }
    
    // Cap trail length and age
    for (let point of this.trail) point.age += 1;
    this.trail = this.trail.filter(p => p.age < 12);
    if (this.trail.length > 20) this.trail.shift();

    // Draw hand skeleton underneath mechanics
    if (hands) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'; 
      for (const lm of hands) {
         const cx = (1 - lm.x) * this.width;
         const cy = lm.y * this.height;
         ctx.beginPath();
         ctx.arc(cx, cy, 3, 0, Math.PI*2);
         ctx.fill();
      }
    }

    this.spawnTarget(now);
    this.checkCollisions(); 

    // Update & draw targets
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const bird = this.targets[i];
      const status = bird.update();
      if (status === "miss") {
         this.onMiss();
         this.combo = 0;
         this.targets.splice(i, 1);
      } else {
        bird.draw(ctx);
      }
    }

    // Update & draw halves
    for (let i = this.halves.length - 1; i >= 0; i--) {
       const half = this.halves[i];
       const offscreen = half.update(this.height);
       if (offscreen) {
          this.halves.splice(i, 1);
       } else {
          half.draw(ctx);
       }
    }

    // Update & draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
       const p = this.particles[i];
       p.update();
       if (p.life <= 0) {
          this.particles.splice(i, 1);
       } else {
          p.draw(ctx);
       }
    }

    // Draw Blade Trail smoothly
    if (this.trail.length > 1) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Draw multiple strokes with reducing sizes to create a glowing blade effect
      const gradientColors = [
         { width: 18, color: 'rgba(6, 182, 212, 0.4)' }, // thick outer glow
         { width: 10, color: 'rgba(34, 211, 238, 0.8)' }, // inner glow
         { width: 4, color: 'rgba(255, 255, 255, 1.0)' }, // white core
      ];

      gradientColors.forEach(({ width, color }) => {
         ctx.beginPath();
         ctx.strokeStyle = color;
         // Make width dynamic based on age (tapering tail)
         for (let i = 0; i < this.trail.length - 1; i++) {
            const p1 = this.trail[i];
            const p2 = this.trail[i + 1];
            // tapering factor
            const factor = (i + 1) / this.trail.length;
            ctx.lineWidth = width * factor;
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
         }
      });
    }
  }
}
