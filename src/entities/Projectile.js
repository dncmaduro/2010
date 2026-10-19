export class Projectile {
  constructor(kind, x, y, options = {}) {
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.vx = options.vx ?? (kind === "sun" ? 286 : -182);
    this.life = options.life ?? 3;
    this.age = 0;
    this.width = kind === "sun" ? 18 : 23;
    this.height = kind === "sun" ? 12 : 11;
    this.variant = options.variant ?? 0;
    this.hit = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.age += dt;
    this.life -= dt;
  }

  isAlive() {
    return this.life > 0 && this.x > -60 && this.x < 540;
  }

  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }
}
