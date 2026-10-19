import { GAME_CONFIG, LOVE_CONFIG, STAGE, VIEWPORT } from "./config.js";
import { getSunForm } from "./sunForms.js";
import { Player } from "./entities/Player.js";
import { Muzan } from "./entities/Muzan.js";
import { Projectile } from "./entities/Projectile.js";
import { Effects } from "./effects.js";
import { AudioManager } from "./audio.js";
import {
  COLORS,
  drawArenaFrame,
  drawBloodTendril,
  drawCastleBackground,
  drawCharacter,
  drawGiftShirt,
  drawGiftTicket,
  drawHeart,
  drawPixelButton,
  drawSunForm,
  drawText,
  px,
  wrapText
} from "./rendering/PixelArt.js";

const START_BUTTON = { x: 130, y: 236, w: 220, h: 25 };
const RETRY_BUTTON = { x: 162, y: 194, w: 156, h: 25 };
const GIFT_RESTART_BUTTON = { x: 30, y: 236, w: 112, h: 23 };
const GIFT_RECEIVE_BUTTON = { x: 336, y: 236, w: 114, h: 23 };

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export class Game {
  constructor(canvas, statusElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.statusElement = statusElement;
    this.screen = "intro";
    this.time = 0;
    this.paused = false;
    this.audio = new AudioManager();
    this.effects = new Effects();
    this.player = new Player();
    this.muzan = new Muzan();
    this.projectiles = [];
    this.input = { up: false, down: false };
    this.hits = 0;
    this.banner = "";
    this.bannerTimer = 0;
    this.warningActive = false;
    this.victoryTimer = 0;
    this.giftRevealTimer = 0;
    this.giftReveal = 0;
    this.claimed = false;
    this.hoverTarget = "";
    this.pointer = { x: 0, y: 0 };
    this.giftImages = {
      shirt: this.loadAsset(GAME_CONFIG.gifts.shirt.asset),
      buffet: this.loadAsset(GAME_CONFIG.gifts.buffet.asset)
    };
    this.spriteSheets = {
      tanjiro: this.loadAsset(GAME_CONFIG.characterSprites.tanjiro),
      muzan: this.loadAsset(GAME_CONFIG.characterSprites.muzan)
    };
    this.currentForm = getSunForm(0);
  }

  loadAsset(src) {
    const image = new Image();
    image.loaded = false;
    image.onload = () => { image.loaded = true; };
    image.onerror = () => { image.loaded = false; };
    image.src = src;
    return image;
  }

  announce(message) {
    if (this.statusElement) this.statusElement.textContent = message;
  }

  startFight() {
    this.audio.ensure();
    this.audio.click();
    this.screen = "fight";
    this.paused = false;
    this.hits = 0;
    this.projectiles.length = 0;
    this.effects.reset();
    this.player.reset();
    this.muzan.reset();
    this.currentForm = getSunForm(0);
    this.warningActive = false;
    this.banner = "";
    this.bannerTimer = 0;
    this.announce("Em bé thối ơi, trận chiến bắt đầu! Dùng W/S hoặc mũi tên để né và Space để tung chiêu.");
  }

  restartToIntro() {
    this.audio.click();
    this.screen = "intro";
    this.paused = false;
    this.projectiles.length = 0;
    this.effects.reset();
    this.player.reset();
    this.muzan.reset();
    this.currentForm = getSunForm(0);
    this.hits = 0;
    this.giftRevealTimer = 0;
    this.giftReveal = 0;
    this.claimed = false;
    this.announce(LOVE_CONFIG.introStory);
  }

  update(dt) {
    const safeDt = Math.min(.05, Math.max(0, dt));
    this.time += safeDt * 1000;
    if (!this.paused) this.effects.update(safeDt);
    this.bannerTimer = Math.max(0, this.bannerTimer - safeDt);

    if (this.screen === "fight") this.updateFight(safeDt);
    else if (this.screen === "victory") this.updateVictory(safeDt);
    else if (this.screen === "gift") this.updateGift(safeDt);
  }

  updateFight(dt) {
    if (this.paused) return;
    this.player.update(dt, this.input);
    this.muzan.update(dt, this.player.y);

    if (this.warningActive && this.muzan.warningTimer <= 0) {
      this.warningActive = false;
      this.spawnBloodVolley(this.muzan.lastAttackY);
    }

    const attackRoll = Math.min(.8, .42 * this.muzan.attackMultiplier);
    if (!this.warningActive && this.muzan.canAttack() && Math.random() < dt * attackRoll) {
      this.warningActive = this.muzan.prepareAttack(this.player.y);
      if (this.warningActive) {
        this.audio.warning();
        this.effects.addText("CẢNH BÁO!", 385, this.muzan.lastAttackY - 14, { color: COLORS.red, size: 9, life: .7, speed: 4 });
        this.announce("Muzan chuẩn bị Dây Thép Gai Hắc Huyết. Hãy di chuyển lên hoặc xuống!");
      }
    }

    for (const projectile of this.projectiles) projectile.update(dt);
    this.resolveCollisions();
    this.projectiles = this.projectiles.filter((projectile) => projectile.isAlive() && !projectile.hit);
  }

  updateVictory(dt) {
    this.victoryTimer += dt;
    this.muzan.updateDeath(dt);
    if (this.victoryTimer > 1.2) this.effects.flash = Math.max(0, this.effects.flash - dt * .55);
    if (this.victoryTimer > 3.8) {
      this.screen = "gift";
      this.giftRevealTimer = 0;
      this.giftReveal = 0;
      this.audio.unlock();
      this.announce(LOVE_CONFIG.giftTitle);
    }
  }

  updateGift(dt) {
    this.giftRevealTimer += dt;
    this.giftReveal = this.giftRevealTimer < 1.05 ? 0 : this.giftRevealTimer < 2.1 ? 1 : 2;
  }

  spawnBloodVolley(y) {
    const haste = this.muzan.hitsTaken;
    const originX = STAGE.enemyX - 17;
    const profile = {
      extendDuration: Math.max(.2, .42 - haste * .017),
      holdDuration: Math.max(.13, .22 - haste * .006),
      retractDuration: Math.max(.2, .46 - haste * .016),
      maxReach: Math.min(346, 326 + haste * 1.7)
    };
    const makeTendril = (offset, variant, reachScale = 1) => this.projectiles.push(new Projectile("blood", originX, y + offset, {
      variant,
      originX,
      maxReach: profile.maxReach * reachScale,
      width: 9 + Math.min(4, haste * .15),
      height: 10,
      life: profile.extendDuration + profile.holdDuration + profile.retractDuration + .02,
      extendDuration: profile.extendDuration,
      holdDuration: profile.holdDuration,
      retractDuration: profile.retractDuration
    }));
    makeTendril(-19, 0, .94);
    makeTendril(0, 1, 1);
    makeTendril(19, 2, .9);
    this.effects.bloodBurst(STAGE.enemyX - 27, y);
    this.audio.tone(74, .18, "sawtooth", .09, 42);
  }

  resolveCollisions() {
    const enemyBounds = this.muzan.getBounds();
    const playerBounds = this.player.getBounds();
    for (const projectile of this.projectiles) {
      if (projectile.kind === "sun" && overlap(projectile.getBounds(), enemyBounds)) {
        projectile.hit = true;
        this.onSuccessfulHit(projectile.x, projectile.y);
      } else if (projectile.kind === "blood" && overlap(projectile.getBounds(), playerBounds)) {
        projectile.hit = true;
        if (this.player.hurt()) {
          this.effects.bloodBurst(this.player.x, this.player.y);
          this.effects.addText("-1 TIM", this.player.x, this.player.y - 35, { color: "#ff7b67", size: 10, life: 1, speed: 17 });
          this.audio.hurt();
          this.announce(`Tanjiro bị thương. Còn ${this.player.hearts} tim.`);
          if (this.player.hearts <= 0) this.gameOver();
        }
      }
    }
  }

  onSuccessfulHit(x, y) {
    const completedForm = this.currentForm;
    this.hits += 1;
    this.muzan.setDifficulty(this.hits);
    this.muzan.hit();
    this.effects.sunBurst(x, y, this.hits, completedForm);
    this.effects.addText("HIT!", x, y - 27, { color: COLORS.hot, size: 14 + Math.min(5, this.hits * .25), life: .75, speed: 22 });
    this.banner = `THỨC THỨ ${completedForm.id}: ${completedForm.nameVi}`;
    this.bannerTimer = 1.05;
    this.audio.hit();
    this.currentForm = getSunForm(this.hits);
    this.announce(`${this.banner} hoàn thành. ${this.hits} trên ${GAME_CONFIG.battle.targetHits}. Muzan tăng tốc x${this.muzan.speedMultiplier.toFixed(1)}.`);
    if (this.hits >= GAME_CONFIG.battle.targetHits) this.startVictory();
  }

  startVictory() {
    this.screen = "victory";
    this.victoryTimer = 0;
    this.projectiles.length = 0;
    this.warningActive = false;
    this.muzan.startDeath();
    this.effects.finalBurst(this.muzan.x, this.muzan.y - 4);
    this.audio.victory();
    this.announce(LOVE_CONFIG.victoryText);
  }

  gameOver() {
    this.screen = "gameover";
    this.paused = false;
    this.projectiles.length = 0;
    this.audio.tone(150, .36, "sawtooth", .16, 55);
    this.announce(LOVE_CONFIG.defeatText);
  }

  attack() {
    if (this.screen !== "fight" || this.paused) return;
    if (this.player.tryAttack()) {
      const form = this.currentForm;
      this.projectiles.push(new Projectile("sun", this.player.x + 24, this.player.y - 4, {
        form,
        vx: form.speed ?? GAME_CONFIG.battle.projectileSpeed,
        life: form.duration,
        width: form.hitbox.width,
        height: form.hitbox.height
      }));
      this.effects.slashes.push({ x: this.player.x + 14, y: this.player.y - 12, life: .23, maxLife: .23, radius: 25, color: COLORS.hot, width: 2 });
      this.audio.slash();
    }
  }

  handleKeyDown(key, repeat = false) {
    const normalized = key.toLowerCase();
    if (normalized === "w" || normalized === "arrowup") { this.input.up = true; return; }
    if (normalized === "s" || normalized === "arrowdown") { this.input.down = true; return; }
    if (normalized === " " || normalized === "spacebar") { if (!repeat) this.attack(); return; }
    if (normalized === "enter" && this.screen === "intro") { this.startFight(); return; }
    if (normalized === "p" && this.screen === "fight") {
      this.paused = !this.paused;
      this.announce(this.paused ? "Đã tạm dừng. Nhấn P để tiếp tục." : "Tiếp tục trận chiến.");
      return;
    }
    if (normalized === "m") {
      const muted = this.audio.toggle();
      this.announce(muted ? "Đã tắt âm thanh." : "Đã bật âm thanh.");
      return;
    }
    if (normalized === "r" && (this.screen === "gameover" || this.screen === "gift")) this.startFight();
  }

  handleKeyUp(key) {
    const normalized = key.toLowerCase();
    if (normalized === "w" || normalized === "arrowup") this.input.up = false;
    if (normalized === "s" || normalized === "arrowdown") this.input.down = false;
  }

  setTouch(action, pressed) {
    if (action === "up") this.input.up = pressed;
    if (action === "down") this.input.down = pressed;
    if (action === "attack" && pressed) this.attack();
  }

  updatePointer(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = clamp((clientX - rect.left) * STAGE.width / rect.width, 0, STAGE.width);
    this.pointer.y = clamp((clientY - rect.top) * STAGE.height / rect.height, 0, STAGE.height);
    this.hoverTarget = this.findPointerTarget(this.pointer.x, this.pointer.y);
  }

  findPointerTarget(x, y) {
    if (this.screen === "intro" && inside(x, y, START_BUTTON)) return "start";
    if (this.screen === "gameover" && inside(x, y, RETRY_BUTTON)) return "retry";
    if (this.screen === "gift" && inside(x, y, GIFT_RESTART_BUTTON)) return "gift-restart";
    if (this.screen === "gift" && inside(x, y, GIFT_RECEIVE_BUTTON) && this.giftReveal >= 2) return "receive";
    return "";
  }

  handlePointerUp(clientX, clientY) {
    this.updatePointer(clientX, clientY);
    const target = this.findPointerTarget(this.pointer.x, this.pointer.y);
    if (target === "start") this.startFight();
    else if (target === "retry") this.startFight();
    else if (target === "gift-restart") this.startFight();
    else if (target === "receive") {
      this.claimed = true;
      this.audio.unlock();
      this.effects.addText("QUÀ ĐÃ ĐƯỢC MỞ KHÓA!", 240, 232, { color: COLORS.hot, size: 10, life: 1.4, speed: 2 });
      this.announce("Anh chíp chối đã mở khóa quà cho Em bé thối rồi!");
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(VIEWPORT.renderScale, 0, 0, VIEWPORT.renderScale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, STAGE.width, STAGE.height);
    if (this.screen === "intro") this.drawIntro(ctx);
    else if (this.screen === "fight") this.drawFight(ctx);
    else if (this.screen === "gameover") { this.drawFight(ctx); this.drawGameOver(ctx); }
    else if (this.screen === "victory") this.drawVictory(ctx);
    else if (this.screen === "gift") this.drawGift(ctx);
    ctx.restore();
  }

  drawIntro(ctx) {
    drawCastleBackground(ctx, this.time, "intro");
    ctx.fillStyle = "rgba(7, 8, 20, .23)";
    ctx.fillRect(0, 0, 480, 270);
    drawText(ctx, GAME_CONFIG.title, 240, 23, { size: 17, align: "center", color: COLORS.hot, weight: 900, shadow: true });
    drawText(ctx, "A PIXEL ART LOVE BATTLE", 240, 36, { size: 6, align: "center", color: COLORS.teal, weight: 900, shadow: false });
    pxPanel(ctx, 23, 46, 434, 42, "rgba(16, 18, 38, .86)");
    wrapText(ctx, GAME_CONFIG.story, 34, 59, 412, 9, { size: 6.5, color: COLORS.white, weight: 600, align: "left" });

    drawCharacter(ctx, "tanjiro", 120, 135, "right", "idle", this.time, 0, this.spriteSheets.tanjiro);
    drawCharacter(ctx, "muzan", 360, 135, "left", "idle", this.time, 0, this.spriteSheets.muzan);
    drawText(ctx, "TANJIRO", 120, 173, { size: 7, align: "center", color: COLORS.teal, weight: 900 });
    drawText(ctx, "MUZAN", 360, 173, { size: 7, align: "center", color: COLORS.red, weight: 900 });
    drawText(ctx, "VS", 240, 142, { size: 13, align: "center", color: COLORS.hot, weight: 900 });
    ctx.save();
    ctx.strokeStyle = COLORS.sun;
    ctx.globalAlpha = .6 + Math.sin(this.time * .006) * .15;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(240, 145, 28, -1.1, .22);
    ctx.stroke();
    ctx.restore();

    pxPanel(ctx, 22, 183, 206, 42, "rgba(11, 15, 32, .88)");
    drawText(ctx, "ĐIỀU KHIỂN", 34, 195, { size: 7, color: COLORS.gold, weight: 900 });
    drawText(ctx, "W / ▲  LÊN     S / ▼  XUỐNG", 34, 207, { size: 7, color: COLORS.white, weight: 700, shadow: false });
    drawText(ctx, "SPACE  HƠI THỞ MẶT TRỜI", 34, 218, { size: 7, color: COLORS.hot, weight: 900, shadow: false });
    pxPanel(ctx, 252, 183, 206, 42, "rgba(11, 15, 32, .88)");
    drawText(ctx, "MỤC TIÊU", 264, 195, { size: 7, color: COLORS.gold, weight: 900 });
    wrapText(ctx, "Đánh trúng Muzan 12 lần. Né Hắc Huyết Chông để giữ 4 tim.", 264, 207, 180, 10, { size: 7, color: COLORS.white, weight: 600 });
    drawPixelButton(ctx, START_BUTTON, "BẮT ĐẦU THÔI EM BÉ THỐI!", { hovered: this.hoverTarget === "start", accent: "gold" });
    drawText(ctx, "ENTER để bắt đầu  •  M âm thanh  •  P tạm dừng", 240, 267, { size: 5.5, align: "center", color: "#aa9a9a", weight: 600, shadow: false });
  }

  drawFight(ctx) {
    drawCastleBackground(ctx, this.time, "fight");
    drawArenaFrame(ctx, this.time);
    this.drawHud(ctx);
    const shake = this.effects.getShakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);
    if (this.warningActive) {
      const pulse = .5 + Math.sin(this.time * .018) * .35;
      ctx.fillStyle = `rgba(225, 53, 66, ${pulse})`;
      ctx.fillRect(38, this.muzan.lastAttackY - 1, 404, 2);
      ctx.fillStyle = `rgba(255, 100, 66, ${pulse * .42})`;
      ctx.fillRect(38, this.muzan.lastAttackY - 8, 404, 16);
      drawText(ctx, "DÂY THÉP GAI HẮC HUYẾT", 240, this.muzan.lastAttackY - 10, { size: 6.5, align: "center", color: COLORS.hot, weight: 900 });
    }
    for (const projectile of this.projectiles) {
      if (projectile.kind === "sun") drawSunForm(ctx, projectile, projectile.form, this.hits);
      else drawBloodTendril(ctx, projectile);
    }
    const playerState = this.player.hurtTimer > 0 ? "hurt" : this.player.attackTimer > 0 ? "attack" : this.player.moveDirection ? "move" : "idle";
    const muzanState = this.muzan.warningTimer > 0 ? "prepare" : this.muzan.hurtTimer > 0 ? "hurt" : "idle";
    drawCharacter(ctx, "tanjiro", this.player.x, this.player.y, "right", playerState, this.time, this.hits, this.spriteSheets.tanjiro);
    drawCharacter(ctx, "muzan", this.muzan.x, this.muzan.y, "left", muzanState, this.time, this.hits, this.spriteSheets.muzan);
    this.effects.draw(ctx);
    ctx.restore();
    if (this.bannerTimer > 0 && this.banner) this.drawBanner(ctx);
    if (this.paused) this.drawPause(ctx);
  }

  drawHud(ctx) {
    ctx.fillStyle = "rgba(8, 10, 23, .95)";
    ctx.fillRect(0, 0, 480, 49);
    pxPanel(ctx, 11, 9, 88, 32, "rgba(30, 25, 45, .95)");
    drawText(ctx, "TANJIRO", 18, 18, { size: 6, color: COLORS.teal, weight: 900 });
    for (let i = 0; i < GAME_CONFIG.battle.playerHearts; i += 1) drawHeart(ctx, 27 + i * 14, 30, i < this.player.hearts, 1);
    drawText(ctx, "CHIÊU", 106, 18, { size: 5.5, color: COLORS.gold, weight: 900 });
    px(ctx, 106, 25, 47, 4, "#32263b");
    const cooldownReady = this.player.canAttack();
    const cooldownFill = cooldownReady ? 47 : Math.max(3, Math.round(47 * (1 - this.player.getCooldownRatio())));
    px(ctx, 106, 25, cooldownFill, 4, cooldownReady ? COLORS.teal : COLORS.hot);
    drawText(ctx, cooldownReady ? "SẴN SÀNG" : `HỒI ${this.player.attackCooldown.toFixed(1)}s`, 106, 38, { size: 5.2, color: cooldownReady ? COLORS.teal : COLORS.hot, weight: 900, shadow: false });
    drawText(ctx, "HƠI THỞ MẶT TRỜI", 240, 14, { size: 7, align: "center", color: COLORS.hot, weight: 900 });
    drawText(ctx, `${this.hits} / ${GAME_CONFIG.battle.targetHits}`, 240, 29, { size: 12, align: "center", color: COLORS.white, weight: 900 });
    drawText(ctx, `${this.currentForm.id}. ${this.currentForm.nameVi}`, 240, 40, { size: 5.5, align: "center", color: COLORS.teal, weight: 900, shadow: false });
    for (let i = 0; i < GAME_CONFIG.battle.targetHits; i += 1) {
      const x = 177 + i * 10.6;
      px(ctx, x, 44, 8, 3, i < this.hits ? (i === 11 ? COLORS.hot : COLORS.teal) : "#34253e");
      if (i < this.hits) px(ctx, x + 1, 45, 6, 1, COLORS.white);
    }
    pxPanel(ctx, 379, 9, 90, 32, "rgba(30, 25, 45, .95)");
    drawText(ctx, "MUZAN", 462, 18, { size: 6, align: "right", color: COLORS.red, weight: 900 });
    drawText(ctx, this.warningActive ? "CHUẨN BỊ..." : `HẮC HUYẾT ×${this.muzan.speedMultiplier.toFixed(1)}`, 462, 32, { size: 6, align: "right", color: this.warningActive ? COLORS.hot : "#b9a8ae", weight: 800 });
  }

  drawBanner(ctx) {
    const alpha = Math.min(1, this.bannerTimer * 4, (1.05 - this.bannerTimer) * 5);
    ctx.save();
    ctx.globalAlpha = alpha;
    pxPanel(ctx, 119, 51, 242, 31, "rgba(75, 34, 49, .94)");
    drawText(ctx, "HƠI THỞ MẶT TRỜI", 240, 61, { size: 5.5, align: "center", color: COLORS.teal, weight: 900, shadow: false });
    drawText(ctx, this.banner, 240, 70, { size: 7, align: "center", color: COLORS.hot, weight: 900 });
    drawText(ctx, "HOÀN THÀNH!", 240, 79, { size: 6, align: "center", color: COLORS.white, weight: 900 });
    ctx.restore();
  }

  drawPause(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(7, 8, 19, .72)";
    ctx.fillRect(0, 0, 480, 270);
    pxPanel(ctx, 153, 104, 174, 58, "rgba(20, 24, 47, .96)");
    drawText(ctx, "TẠM DỪNG", 240, 127, { size: 14, align: "center", color: COLORS.hot, weight: 900 });
    drawText(ctx, "Nhấn P để tiếp tục", 240, 145, { size: 8, align: "center", color: COLORS.white, weight: 700 });
    ctx.restore();
  }

  drawGameOver(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(7, 6, 15, .78)";
    ctx.fillRect(0, 0, 480, 270);
    pxPanel(ctx, 115, 66, 250, 162, "rgba(22, 16, 35, .98)");
    drawText(ctx, "THỬ LẠI NÀO!", 240, 108, { size: 20, align: "center", color: COLORS.red, weight: 900 });
    wrapText(ctx, LOVE_CONFIG.defeatText, 240, 129, 192, 11, { size: 7, color: COLORS.white, weight: 700, align: "center" });
    drawText(ctx, "12 thức vẫn đang chờ em hoàn thành.", 240, 157, { size: 8, align: "center", color: COLORS.gold, weight: 700 });
    drawPixelButton(ctx, RETRY_BUTTON, "CHƠI LẠI", { hovered: this.hoverTarget === "retry", accent: "red" });
    drawText(ctx, "R để chơi lại", 240, 229, { size: 6, align: "center", color: "#bcaab1", weight: 600, shadow: false });
    ctx.restore();
  }

  drawVictory(ctx) {
    drawCastleBackground(ctx, this.time, "fight");
    drawArenaFrame(ctx, this.time);
    const shake = this.effects.getShakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);
    const playerState = this.victoryTimer < .9 ? "attack" : "idle";
    drawCharacter(ctx, "tanjiro", this.player.x, this.player.y, "right", playerState, this.time, 12, this.spriteSheets.tanjiro);
    drawCharacter(ctx, "muzan", this.muzan.x, this.muzan.y, "left", "death", this.muzan.deathTimer * 1000, 12, this.spriteSheets.muzan);
    this.effects.draw(ctx);
    ctx.restore();
    const fade = clamp((this.victoryTimer - .8) / 1.1, 0, .5);
    if (fade > 0) {
      ctx.fillStyle = `rgba(8, 7, 17, ${fade})`;
      ctx.fillRect(0, 0, 480, 270);
    }
    if (this.victoryTimer > .52) {
      drawText(ctx, LOVE_CONFIG.victoryText, 240, 117, { size: 16, align: "center", color: COLORS.hot, weight: 900 });
      drawText(ctx, "THỨC THỨ 12 — MẶT TRỜI BẤT DIỆT", 240, 136, { size: 7, align: "center", color: COLORS.white, weight: 900 });
    }
    if (this.bannerTimer > 0 && this.banner) this.drawBanner(ctx);
  }

  drawGift(ctx) {
    drawCastleBackground(ctx, this.time, "intro");
    ctx.fillStyle = "rgba(6, 7, 18, .72)";
    ctx.fillRect(0, 0, 480, 270);
    pxPanel(ctx, 13, 14, 454, 245, "rgba(17, 19, 39, .97)");
    drawText(ctx, LOVE_CONFIG.giftTitle, 240, 35, { size: 13, align: "center", color: COLORS.hot, weight: 900 });
    drawText(ctx, "♥", 396, 35, { size: 11, align: "center", color: COLORS.red, weight: 900, shadow: false });
    drawText(ctx, LOVE_CONFIG.giftSubtitle, 240, 49, { size: 6.3, align: "center", color: COLORS.white, weight: 600 });
    drawText(ctx, LOVE_CONFIG.giftIntro, 240, 59, { size: 6.3, align: "center", color: COLORS.teal, weight: 800 });
    this.drawGiftCard(ctx, 26, 68, 207, 100, "shirt", this.giftReveal >= 1, GAME_CONFIG.gifts.shirt.title);
    this.drawGiftCard(ctx, 247, 68, 207, 100, "buffet", this.giftReveal >= 2, GAME_CONFIG.gifts.buffet.title);
    wrapText(ctx, LOVE_CONFIG.message, 240, 184, 424, 10, { size: 7.1, color: COLORS.white, weight: 600, align: "center" });
    drawPixelButton(ctx, GIFT_RESTART_BUTTON, "CHƠI LẠI", { hovered: this.hoverTarget === "gift-restart", accent: "teal" });
    drawPixelButton(ctx, GIFT_RECEIVE_BUTTON, this.claimed ? "ĐÃ NHẬN QUÀ" : "NHẬN QUÀ", { hovered: this.hoverTarget === "receive", accent: "gold", disabled: this.giftReveal < 2 });
    if (this.giftReveal < 2) drawText(ctx, "Món quà đang mở khóa...", 240, 231, { size: 6, align: "center", color: "#c1a5a7", weight: 600, shadow: false });
  }

  drawGiftCard(ctx, x, y, w, h, type, unlocked, title) {
    ctx.save();
    pxPanel(ctx, x, y, w, h, unlocked ? "rgba(36, 57, 59, .97)" : "rgba(28, 27, 43, .96)");
    ctx.strokeStyle = unlocked ? COLORS.gold : "#4b4050";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    if (unlocked) {
      const image = this.giftImages[type];
      if (image?.loaded) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, x + 9, y + 7, 62, 58);
        ctx.restore();
      } else if (type === "shirt") drawGiftShirt(ctx, x + 40, y + 35, .85);
      else drawGiftTicket(ctx, x + 39, y + 35, .72);
      drawText(ctx, title.toUpperCase(), x + 78, y + 27, { size: type === "shirt" ? 9 : 7, color: COLORS.hot, weight: 900 });
      drawText(ctx, "ĐÃ MỞ KHÓA", x + 78, y + 42, { size: 6, color: COLORS.teal, weight: 900 });
      drawText(ctx, type === "shirt" ? "Một chiếc áo dành riêng cho em bé thối." : "Một buổi buffet thật ngon đang chờ em.", x + 78, y + 59, { size: 6, color: COLORS.white, weight: 600 });
    } else {
      ctx.fillStyle = "#0c1022";
      ctx.fillRect(x + 14, y + 13, 52, 54);
      drawText(ctx, "?", x + 40, y + 50, { size: 28, align: "center", color: "#7a6671", weight: 900 });
      drawText(ctx, "ĐANG MỞ KHÓA", x + 78, y + 32, { size: 7, color: "#a38f96", weight: 900 });
      drawText(ctx, "Hãy chờ ánh sáng mặt trời...", x + 78, y + 49, { size: 6, color: "#9d9298", weight: 600 });
    }
    ctx.restore();
  }
}

function inside(x, y, rect) { return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h; }

function pxPanel(ctx, x, y, w, h, fill) {
  ctx.save();
  ctx.fillStyle = "#080a15";
  ctx.fillRect(x, y + 2, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x + 2, y, w - 4, h - 2);
  ctx.fillStyle = "rgba(255, 200, 87, .22)";
  ctx.fillRect(x + 4, y + 2, w - 8, 1);
  ctx.restore();
}
