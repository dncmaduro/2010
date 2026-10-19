export class Projectile {
  constructor(kind, x, y, options = {}) {
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.vx = options.vx ?? (kind === "sun" ? 286 : -182);
    this.life = options.life ?? 3;
    this.age = 0;
    this.form = options.form ?? null;
    this.width = options.width ?? (kind === "sun" ? 18 : 23);
    this.height = options.height ?? (kind === "sun" ? 12 : 11);
    this.variant = options.variant ?? 0;
    this.hit = false;
    this.originX = options.originX ?? x;
    this.maxReach = options.maxReach ?? 330;
    this.extendDuration = options.extendDuration ?? .38;
    this.holdDuration = options.holdDuration ?? .2;
    this.retractDuration = options.retractDuration ?? .42;
    this.tipProgress = kind === "blood" ? 0 : 1;
  }

  update(dt) {
    this.age += dt;
    this.life -= dt;
    if (this.kind === "blood") {
      const extendEnd = this.extendDuration;
      const holdEnd = extendEnd + this.holdDuration;
      const retractEnd = holdEnd + this.retractDuration;
      if (this.age <= extendEnd) {
        this.tipProgress = Math.min(1, this.age / extendEnd);
      } else if (this.age <= holdEnd) {
        this.tipProgress = 1;
      } else {
        this.tipProgress = Math.max(0, 1 - (this.age - holdEnd) / this.retractDuration);
      }
      this.x = this.originX - this.maxReach * this.tipProgress;
      if (this.age >= retractEnd) this.life = 0;
      return;
    }
    this.x += this.vx * dt;
  }

  isAlive() {
    return this.life > 0 && (this.kind === "blood" || (this.x > -60 && this.x < 540));
  }

  getBounds() {
    if (this.kind === "blood") {
      const left = Math.min(this.originX, this.x) - this.width / 2;
      const right = Math.max(this.originX, this.x) + this.width / 2;
      return { left, right, top: this.y - this.height / 2, bottom: this.y + this.height / 2 };
    }
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }
}
