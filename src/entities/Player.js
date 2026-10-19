import { GAME_CONFIG, STAGE } from "../config.js";

export class Player {
  constructor() {
    this.x = STAGE.playerX;
    this.y = 158;
    this.width = 30;
    this.height = 58;
    this.speed = GAME_CONFIG.battle.playerSpeed;
    this.hearts = GAME_CONFIG.battle.playerHearts;
    this.invulnerable = 0;
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.hurtTimer = 0;
    this.moveDirection = 0;
  }

  reset() {
    this.y = 158;
    this.hearts = GAME_CONFIG.battle.playerHearts;
    this.invulnerable = 0;
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.hurtTimer = 0;
    this.moveDirection = 0;
  }

  update(dt, input) {
    this.moveDirection = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    this.y += this.moveDirection * this.speed * dt;
    this.y = Math.max(STAGE.playerMinY, Math.min(STAGE.playerMaxY, this.y));
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
  }

  tryAttack() {
    if (this.attackCooldown > 0 || this.attackTimer > 0) return false;
    this.attackCooldown = GAME_CONFIG.battle.attackCooldown;
    this.attackTimer = 0.34;
    return true;
  }

  hurt() {
    if (this.invulnerable > 0) return false;
    this.hearts -= 1;
    this.invulnerable = GAME_CONFIG.battle.invincibility;
    this.hurtTimer = 0.38;
    return true;
  }

  getBounds() {
    return { left: this.x - 12, right: this.x + 14, top: this.y - 25, bottom: this.y + 28 };
  }
}
