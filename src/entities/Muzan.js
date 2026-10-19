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
      this.moveTimer = 0.9 + Math.random() * 1.3;
      const follow = Math.random() < 0.48 ? playerY : STAGE.enemyMinY + 8 + Math.random() * (STAGE.enemyMaxY - STAGE.enemyMinY - 16);
      this.targetY = Math.max(STAGE.enemyMinY, Math.min(STAGE.enemyMaxY, follow + (Math.random() * 54 - 27)));
    }
    const distance = this.targetY - this.y;
    const step = GAME_CONFIG.battle.enemySpeed * dt;
    this.y += Math.max(-step, Math.min(step, distance));
    this.attackTimer -= dt;
  }

  canAttack() {
    return this.alive && this.warningTimer <= 0 && this.attackTimer <= 0;
  }

  prepareAttack(playerY) {
    if (!this.canAttack()) return false;
    this.lastAttackY = Math.max(STAGE.enemyMinY, Math.min(STAGE.enemyMaxY, playerY + (Math.random() * 50 - 25)));
    this.warningTimer = GAME_CONFIG.battle.warningDuration;
    this.attackTimer = 2.35 + Math.random() * 1.25;
    return true;
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
