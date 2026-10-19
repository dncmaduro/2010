import { GAME_CONFIG, STAGE } from "../config.js";

export class Muzan {
  constructor() {
    this.x = STAGE.enemyX;
    this.y = 158;
    // Separate collision footprint from the smaller character sprite.
    this.width = 25;
    this.height = 46;
    this.targetY = 158;
    this.moveTimer = 0;
    this.attackTimer = 2.25;
    this.warningTimer = 0;
    this.hurtTimer = 0;
    this.deathTimer = 0;
    this.alive = true;
    this.lastAttackY = 158;
    this.hitsTaken = 0;
    this.speedMultiplier = 1;
    this.attackMultiplier = 1;
    this.attackCount = 0;
  }

  reset() {
    this.y = 158;
    this.targetY = 158;
    this.moveTimer = 0.4;
    this.attackTimer = 2.25;
    this.warningTimer = 0;
    this.hurtTimer = 0;
    this.deathTimer = 0;
    this.alive = true;
    this.lastAttackY = 158;
    this.hitsTaken = 0;
    this.speedMultiplier = 1;
    this.attackMultiplier = 1;
    this.attackCount = 0;
  }

  setDifficulty(hitsTaken) {
    this.hitsTaken = Math.max(0, hitsTaken);
    // Escalate after every completed form while keeping the pattern readable.
    this.speedMultiplier = 1 + Math.min(.72, this.hitsTaken * .06);
    this.attackMultiplier = 1 + Math.min(.9, this.hitsTaken * .075);
  }

  update(dt, playerY) {
    if (!this.alive) return;
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    if (this.warningTimer > 0) {
      this.warningTimer = Math.max(0, this.warningTimer - dt);
      return;
    }
    this.moveTimer -= dt;
    if (this.moveTimer <= 0) {
      const pauseMin = Math.max(.48, .9 - this.hitsTaken * .025);
      const pauseRange = Math.max(.56, 1.3 - this.hitsTaken * .045);
      this.moveTimer = pauseMin + Math.random() * pauseRange;
      const follow = Math.random() < 0.48 ? playerY : STAGE.enemyMinY + 8 + Math.random() * (STAGE.enemyMaxY - STAGE.enemyMinY - 16);
      this.targetY = Math.max(STAGE.enemyMinY, Math.min(STAGE.enemyMaxY, follow + (Math.random() * 54 - 27)));
    }
    const distance = this.targetY - this.y;
    const step = GAME_CONFIG.battle.enemySpeed * this.speedMultiplier * dt;
    this.y += Math.max(-step, Math.min(step, distance));
    this.attackTimer -= dt;
  }

  canAttack() {
    return this.alive && this.warningTimer <= 0 && this.attackTimer <= 0;
  }

  prepareAttack(playerY) {
    if (!this.canAttack()) return false;
    // Rotate through three readable lanes instead of always aiming at the
    // player's usual lower starting position. A small amount of player
    // tracking keeps the attack threatening without making it unavoidable.
    const lanes = [
      STAGE.enemyMinY + 12,
      (STAGE.enemyMinY + STAGE.enemyMaxY) * .5,
      STAGE.enemyMaxY - 12
    ];
    const laneIndex = (this.attackCount + this.hitsTaken) % lanes.length;
    const laneTarget = lanes[laneIndex];
    const target = Math.random() < .72 ? laneTarget : playerY;
    this.lastAttackY = Math.max(STAGE.enemyMinY + 4, Math.min(STAGE.enemyMaxY - 4, target + (Math.random() * 18 - 9)));
    this.attackCount += 1;
    this.warningTimer = Math.max(.54, GAME_CONFIG.battle.warningDuration - this.hitsTaken * .012);
    const baseCooldown = Math.max(1.28, 2.35 / this.attackMultiplier);
    const randomRange = Math.max(.48, 1.25 / this.attackMultiplier);
    this.attackTimer = baseCooldown + Math.random() * randomRange;
    return true;
  }

  getVolleySpeed(index = 0) {
    const base = 188 + this.hitsTaken * 5.5;
    return Math.min(278, base + index * 7);
  }

  finishAttack() {
    const y = this.lastAttackY;
    this.warningTimer = -1;
    return y;
  }

  hit() {
    this.hurtTimer = 0.36;
  }

  startDeath() {
    this.alive = false;
    this.deathTimer = 0;
    this.warningTimer = 0;
  }

  updateDeath(dt) {
    this.deathTimer += dt;
  }

  getBounds() {
    return { left: this.x - 12, right: this.x + 13, top: this.y - 22, bottom: this.y + 23 };
  }
}
