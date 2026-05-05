class Particle {
  constructor() {
    this.active = false;
  }
  reset(x, y, color) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2;
    this.life = 1.0;
    this.decay = Math.random() * 0.05 + 0.03;
    this.color = color;
    this.size = Math.random() * 4 + 2;
    this.active = true;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 0.2 * dt; // gravity
    this.life -= (this.decay * dt);
    if (this.life <= 0) this.active = false;
  }
  draw(ctx) {
    if (!this.active) return;
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

class TargetHalf {
  constructor() {
    this.active = false;
  }
  reset(x, y, vx, vy, size, isLeft, angle = 0) {
    this.x = x;
    this.y = y;
    
    // Normal vector to push halves apart perpendicularly
    const nx = Math.cos(angle + Math.PI / 2);
    const ny = Math.sin(angle + Math.PI / 2);
    const pushForce = 3 + Math.random() * 2;
    const dir = isLeft ? -1 : 1;
    
    this.vx = vx + nx * pushForce * dir;
    this.vy = vy + ny * pushForce * dir;
    
    this.size = size;
    this.rotation = angle - Math.PI / 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.15;
    this.isLeft = isLeft;
    this.gravity = 0.4;
    this.active = true;
  }
  update(canvasHeight, dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.rotation += this.rotationSpeed * dt;
    if (this.y > canvasHeight + this.size * 2) this.active = false;
  }
  draw(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y));
    ctx.rotate(this.rotation);
    
    const grad = ctx.createRadialGradient(-this.size/4, -this.size/4, 2, 0, 0, this.size / 2);
    grad.addColorStop(0, '#fca5a5');
    grad.addColorStop(0.7, '#ef4444');
    grad.addColorStop(1, '#7f1d1d');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, this.isLeft ? Math.PI / 2 : -Math.PI / 2, this.isLeft ? -Math.PI / 2 : Math.PI / 2);
    ctx.fill();
    
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(this.isLeft ? 2 : -2, 0, this.size / 2 - 4, this.isLeft ? Math.PI / 2 : -Math.PI / 2, this.isLeft ? -Math.PI / 2 : Math.PI / 2);
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    if (this.isLeft) {
      ctx.arc(4, -5, 2, 0, Math.PI * 2);
      ctx.arc(4, 5, 2, 0, Math.PI * 2);
    } else {
      ctx.arc(-4, -5, 2, 0, Math.PI * 2);
      ctx.arc(-4, 5, 2, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.restore();
  }
}

class ObjectPool {
  constructor(createFn, size = 100) {
    this.pool = Array.from({length: size}, createFn);
    this.active = [];
    this.createFn = createFn;
  }
  acquire(...args) {
    let obj = this.pool.pop() || this.createFn(); 
    if (obj.reset) obj.reset(...args);
    this.active.push(obj);
    return obj;
  }
  release(obj) {
    const idx = this.active.indexOf(obj);
    if (idx > -1) {
      this.active.splice(idx, 1);
      this.pool.push(obj);
    }
  }
}

export class Target {
  constructor(canvasWidth, canvasHeight, speedMultiplier = 1) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    const baseSize = Math.max(40, canvasHeight * 0.08);
    this.size = baseSize + (Math.random() - 0.5) * (baseSize * 0.3);
    
    this.x = canvasWidth * 0.2 + (Math.random() * canvasWidth * 0.6);
    this.y = canvasHeight + this.size;
    
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
    this.flashFrames = 0;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt; 
    this.rotation += this.rotationSpeed * dt;

    if (this.y > this.canvasHeight + this.size * 2 && this.vy > 0) {
      this.active = false;
      return "miss";
    }
    return "active";
  }

  draw(ctx, sprite) {
    if (!this.active) return;
    
    if (this.flashFrames > 0) {
      ctx.save();
      ctx.translate(Math.round(this.x), Math.round(this.y));
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2 + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y));
    ctx.rotate(this.rotation);
    
    // Scale from base radius 40 to this.size / 2
    const scale = (this.size / 2) / 40;
    ctx.scale(scale, scale);
    
    // The sprite has its center at (50, 70) which corresponds to (0, 0) of the drawn target
    ctx.drawImage(
      sprite, 
      -50, -70 
    );

    ctx.restore();
  }
}

export class GameState {
  constructor(width, height, onScore, onMiss) {
    this.width = width;
    this.height = height;
    this.targets = [];
    this.trail = [];
    this.crosshairTrail = [];
    this.onScore = onScore;
    this.onMiss = onMiss;
    this.score = 0;
    this.combo = 0;
    this.lastSpawnTime = 0;
    this.spawnInterval = 1500;
    
    // Pools
    this.particlePool = new ObjectPool(() => new Particle(), 200);
    this.halfPool = new ObjectPool(() => new TargetHalf(), 50);

    // Sprite Cache
    this.appleSprite = document.createElement('canvas');
    this.appleSprite.width = 100; 
    this.appleSprite.height = 120; 
    const sCtx = this.appleSprite.getContext('2d');
    
    sCtx.translate(50, 70); 
    
    const grad = sCtx.createRadialGradient(-10, -10, 5, 0, 0, 40);
    grad.addColorStop(0, '#fca5a5');
    grad.addColorStop(0.7, '#ef4444');
    grad.addColorStop(1, '#7f1d1d');
    
    sCtx.fillStyle = grad; 
    sCtx.beginPath();
    sCtx.arc(0, 0, 40, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.closePath();
    
    sCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for(let i=0; i<12; i++) {
       const a = Math.random() * Math.PI * 2;
       const r = Math.random() * 30 + 5;
       sCtx.beginPath();
       sCtx.arc(Math.cos(a)*r, Math.sin(a)*r, Math.random()*1.5 + 1, 0, Math.PI*2);
       sCtx.fill();
    }

    sCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    sCtx.beginPath();
    sCtx.arc(-15, -15, 15, 0, Math.PI * 2);
    sCtx.fill();

    sCtx.strokeStyle = '#4d7c0f'; 
    sCtx.lineWidth = 4;
    sCtx.lineCap = 'round';
    sCtx.beginPath();
    sCtx.moveTo(0, -38);
    sCtx.quadraticCurveTo(15, -55, 25, -50);
    sCtx.stroke();
    
    sCtx.fillStyle = '#65a30d';
    sCtx.beginPath();
    sCtx.ellipse(15, -45, 10, 4, Math.PI / 4, 0, Math.PI * 2);
    sCtx.fill();
    
    this.globalFlash = 0;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  spawnTarget(now) {
    if (now - this.lastSpawnTime > this.spawnInterval) {
      const speedMultiplier = 1 + (this.score * 0.003);
      const count = 1 + Math.floor(Math.random() * 3);
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

  createSliceEffect(target, angle = 0) {
    this.halfPool.acquire(target.x, target.y, target.vx, target.vy, target.size, true, angle);
    this.halfPool.acquire(target.x, target.y, target.vx, target.vy, target.size, false, angle);
    
    for (let i = 0; i < 20; i++) {
       this.particlePool.acquire(target.x, target.y, '#fef08a');
       this.particlePool.acquire(target.x, target.y, '#ef4444');
    }
  }

  checkCollisions() {
    let slicedCount = 0;
    if (this.trail.length < 2) return;

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const bird = this.targets[i];
      if (!bird.active || bird.flashFrames > 0) continue;
      
      let sliced = false;
      let sliceAngle = 0;
      for (let j = 0; j < this.trail.length - 1; j++) {
        const p1 = this.trail[j];
        const p2 = this.trail[j+1];
        
        const distSq = this.distToSegmentSq(bird, p1, p2);
        const radiusSq = Math.pow(bird.size / 2 + 15, 2); 
        
        if (distSq <= radiusSq) {
          sliced = true;
          sliceAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          break; 
        }
      }

      if (sliced) {
        bird.flashFrames = 3; 
        bird.sliceAngle = sliceAngle;
        slicedCount++;
      }
    }

    if (slicedCount > 0) {
       this.combo += slicedCount;
       const pointsEarned = 10 * this.combo;
       this.score += pointsEarned;
       this.onScore(pointsEarned, this.combo);
       this.globalFlash = 80; 
    }
  }

  updateAndDraw(ctx, crosshairX, crosshairY, handVisible, deltaMs) {
    const dt = Math.min(deltaMs / 16.667, 3);
    const now = performance.now();

    ctx.clearRect(0, 0, this.width, this.height);

    if (handVisible && crosshairX !== null && crosshairY !== null) {
       this.trail.push({ x: crosshairX, y: crosshairY, t: now });
       this.crosshairTrail.push({ x: crosshairX, y: crosshairY });
       if (this.crosshairTrail.length > 8) this.crosshairTrail.shift();
    } else {
       this.crosshairTrail.shift();
    }
    
    // Trail segments only live for 150ms to catch fast swipes properly
    this.trail = this.trail.filter(p => now - p.t < 150);

    this.spawnTarget(now);
    this.checkCollisions(); 

    // Update & draw targets
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const bird = this.targets[i];
      
      if (bird.flashFrames > 0) {
        bird.flashFrames -= 1;
        if (bird.flashFrames <= 0) {
           bird.active = false;
           this.createSliceEffect(bird, bird.sliceAngle);
           this.targets.splice(i, 1);
           continue;
        }
      }
      
      const status = bird.update(dt);
      if (status === "miss") {
         this.onMiss();
         this.combo = 0;
         this.targets.splice(i, 1);
      } else {
        bird.draw(ctx, this.appleSprite);
      }
    }

    // Update & draw halves
    for (let i = this.halfPool.active.length - 1; i >= 0; i--) {
       const half = this.halfPool.active[i];
       half.update(this.height, dt);
       if (!half.active) {
          this.halfPool.release(half);
       } else {
          half.draw(ctx);
       }
    }

    // Update & draw particles
    for (let i = this.particlePool.active.length - 1; i >= 0; i--) {
       const p = this.particlePool.active[i];
       p.update(dt);
       if (!p.active) {
          this.particlePool.release(p);
       } else {
          p.draw(ctx);
       }
    }

    // Draw Motion Trail Crosshair
    if (this.crosshairTrail.length > 1) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 1; i < this.crosshairTrail.length; i++) {
        const alpha = i / this.crosshairTrail.length;
        ctx.strokeStyle = `rgba(255, 220, 50, ${alpha})`;
        ctx.lineWidth = alpha * 4;
        ctx.beginPath();
        ctx.moveTo(this.crosshairTrail[i-1].x, this.crosshairTrail[i-1].y);
        ctx.lineTo(this.crosshairTrail[i].x, this.crosshairTrail[i].y);
        ctx.stroke();
      }
    }

    // Draw Haptic Flash for slice feedback
    if (this.globalFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, 0.15)`;
      ctx.fillRect(0, 0, this.width, this.height);
      this.globalFlash -= deltaMs;
    }
  }
}
