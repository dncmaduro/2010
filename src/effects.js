import { COLORS, drawText } from "./rendering/PixelArt.js";

export class Effects {
  constructor() {
    this.particles = [];
    this.slashes = [];
    this.floatingTexts = [];
    this.flash = 0;
    this.flashColor = "#fff4d0";
    this.shake = 0;
    this.shakePower = 0;
  }

  reset() {
    this.particles.length = 0;
    this.slashes.length = 0;
    this.floatingTexts.length = 0;
    this.flash = 0;
    this.shake = 0;
    this.shakePower = 0;
  }

  update(dt) {
    this.flash = Math.max(0, this.flash - dt);
    this.shake = Math.max(0, this.shake - dt);
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += particle.gravity * dt;
      particle.life -= dt;
      particle.rotation += particle.spin * dt;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
    for (const slash of this.slashes) slash.life -= dt;
    this.slashes = this.slashes.filter((slash) => slash.life > 0);
    for (const item of this.floatingTexts) {
      item.y -= item.speed * dt;
      item.life -= dt;
    }
    this.floatingTexts = this.floatingTexts.filter((item) => item.life > 0);
  }

  addParticle(x, y, options = {}) {
    const angle = options.angle ?? Math.random() * Math.PI * 2;
    const speed = options.speed ?? (25 + Math.random() * 70);
    this.particles.push({
      x, y,
      vx: options.vx ?? Math.cos(angle) * speed,
      vy: options.vy ?? Math.sin(angle) * speed,
      gravity: options.gravity ?? 22,
      life: options.life ?? (.35 + Math.random() * .5),
      maxLife: options.life ?? (.35 + Math.random() * .5),
      size: options.size ?? (1 + Math.random() * 2.5),
      color: options.color ?? COLORS.hot,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - .5) * 5,
      shape: options.shape ?? "square"
    });
    if (this.particles.length > 520) this.particles.splice(0, this.particles.length - 520);
  }

  burst(x, y, count, palette, options = {}) {
    for (let i = 0; i < count; i += 1) {
      this.addParticle(x, y, {
        color: palette[i % palette.length],
        speed: options.speed ?? (35 + Math.random() * 100),
        life: options.life ?? (.25 + Math.random() * .7),
        gravity: options.gravity ?? 18,
        size: options.size ?? (1 + Math.random() * 2.8),
        shape: options.shape ?? (i % 4 === 0 ? "diamond" : "square")
      });
    }
  }

  sunBurst(x, y, intensity = 1) {
    this.burst(x, y, 12 + intensity * 3, [COLORS.hot, COLORS.sun, COLORS.ember, "#fff2ae"], { speed: 55 + intensity * 6, life: .35 + intensity * .02, gravity: 10 });
    this.slashes.push({ x, y, life: .35, maxLife: .35, radius: 24 + intensity * 2, color: COLORS.hot, width: 2 + intensity * .1 });
    this.shake = Math.min(.35, .08 + intensity * .012);
    this.shakePower = Math.min(6, 1.2 + intensity * .22);
  }

  bloodBurst(x, y) {
    this.burst(x, y, 11, [COLORS.red, "#71233e", "#e74b4f", "#36152b"], { speed: 45, life: .42, gravity: 26, size: 1.6 });
    this.shake = .12;
    this.shakePower = 2;
  }

  finalBurst(x, y) {
    this.burst(x, y, 105, [COLORS.hot, COLORS.sun, COLORS.ember, "#fff6bd", "#ffe07a"], { speed: 125, life: .55 + Math.random() * .5, gravity: -18, size: 2.2, shape: "diamond" });
    this.slashes.push({ x, y, life: 1.45, maxLife: 1.45, radius: 78, color: COLORS.hot, width: 5 });
    this.slashes.push({ x, y, life: 1.1, maxLife: 1.1, radius: 48, color: "#fff8c5", width: 2 });
    this.flash = .62;
    this.flashColor = "#fff4bf";
    this.shake = .8;
    this.shakePower = 8;
  }

  addText(text, x, y, options = {}) {
    this.floatingTexts.push({ text, x, y, life: options.life ?? 1, maxLife: options.life ?? 1, speed: options.speed ?? 15, color: options.color ?? COLORS.hot, size: options.size ?? 13 });
  }

  getShakeOffset() {
    if (this.shake <= 0) return { x: 0, y: 0 };
    const amount = this.shakePower * (this.shake / .8);
    return { x: (Math.random() * 2 - 1) * amount, y: (Math.random() * 2 - 1) * amount * .55 };
  }

  draw(ctx) {
    for (const slash of this.slashes) {
      const alpha = Math.max(0, slash.life / slash.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha * .85;
      ctx.strokeStyle = slash.color;
      ctx.lineWidth = slash.width;
      ctx.shadowBlur = 10;
      ctx.shadowColor = slash.color;
      ctx.beginPath();
      ctx.arc(slash.x, slash.y, slash.radius * (1.05 - alpha * .12), -1.05, .74);
      ctx.stroke();
      ctx.restore();
    }
    for (const particle of this.particles) {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      if (particle.shape === "diamond") {
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * 2);
        ctx.lineTo(particle.size, 0);
        ctx.lineTo(0, particle.size * 2);
        ctx.lineTo(-particle.size, 0);
        ctx.closePath();
        ctx.fill();
      } else ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
    }
    for (const item of this.floatingTexts) {
      drawText(ctx, item.text, item.x, item.y, { size: item.size, color: item.color, align: "center", weight: 900, shadow: true });
    }
    if (this.flash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(.72, this.flash * 1.2);
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }
}
