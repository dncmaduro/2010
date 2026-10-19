export const COLORS = {
  ink: "#080914",
  night: "#111329",
  purple: "#262348",
  plum: "#4b2847",
  gold: "#ffc857",
  sun: "#ff8f3d",
  hot: "#ffcf62",
  ember: "#f04d38",
  red: "#b7314e",
  teal: "#3dcdb5",
  tealDark: "#163d4c",
  skin: "#f3b39c",
  skinLight: "#ffd1b2",
  hair: "#160f1f",
  hairRed: "#732f3b",
  cloth: "#152942",
  clothLight: "#254862",
  white: "#fff4d0",
  pale: "#dfe4e1"
};

export const px = (ctx, x, y, width, height, fill) => {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
};

const poly = (ctx, points, fill) => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
};

export function drawCastleBackground(ctx, time, mode = "fight") {
  const w = 480;
  const h = 270;
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, mode === "intro" ? "#13162e" : "#0b1022");
  gradient.addColorStop(.55, "#211932");
  gradient.addColorStop(1, "#0a0c18");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = .6;
  for (let i = 0; i < 22; i += 1) {
    const sx = (i * 83 + 26) % w;
    const sy = 12 + ((i * 41) % 105);
    const twinkle = 1 + Math.sin(time * .0018 + i) * .55;
    px(ctx, sx, sy, twinkle, twinkle, i % 3 === 0 ? "#f5bc72" : "#b5a7c8");
  }
  ctx.restore();

  // Distant suspended rooms for the Infinity Castle atmosphere.
  ctx.save();
  ctx.globalAlpha = .48;
  const drift = Math.sin(time * .00035) * 5;
  for (let i = 0; i < 5; i += 1) {
    const x = i * 112 - 20 + drift * (i % 2 ? 1 : -.5);
    const y = 45 + (i % 2) * 18;
    px(ctx, x, y, 92, 52, "#271b3e");
    px(ctx, x + 7, y + 7, 78, 3, "#543054");
    px(ctx, x + 7, y + 45, 78, 3, "#121525");
    for (let k = 0; k < 4; k += 1) px(ctx, x + 12 + k * 19, y + 17, 9, 19, "#111a2a");
  }
  ctx.restore();

  // Tall wooden beams and shoji panels.
  px(ctx, 15, 52, 8, 186, "#19152a");
  px(ctx, 20, 55, 3, 181, "#6b3544");
  px(ctx, 456, 47, 9, 193, "#171329");
  px(ctx, 457, 55, 4, 178, "#693442");
  for (const y of [73, 119, 165, 211]) {
    px(ctx, 0, y, w, 4, "#211b32");
    px(ctx, 0, y, w, 1, "#71414b");
  }
  for (let x = 38; x < 456; x += 42) {
    const offset = Math.sin(time * .0004 + x) * 3;
    px(ctx, x + offset, 71, 3, 147, "#3f2940");
    px(ctx, x + offset, 74, 1, 141, "#95604a");
  }

  // Floor depth and glowing stage line.
  ctx.fillStyle = "#0c1120";
  ctx.beginPath();
  ctx.moveTo(0, 222);
  ctx.lineTo(w, 218);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  px(ctx, 0, 220, w, 2, "#4b3042");
  px(ctx, 0, 222, w, 1, "#e06b47");
  for (let x = -20; x < w + 50; x += 68) {
    const glide = (time * .018) % 68;
    px(ctx, x - glide, 236, 34, 1, "#29304a");
    px(ctx, x - glide + 18, 247, 28, 1, "#1e263c");
  }

  drawLantern(ctx, 48, 86, time, 1);
  drawLantern(ctx, 432, 94, time + 360, .9);
  drawLantern(ctx, 245, 61, time + 780, .65);
}

function drawLantern(ctx, x, y, time, scale) {
  const pulse = 0.88 + Math.sin(time * .004) * .08;
  ctx.save();
  ctx.globalAlpha = .9;
  ctx.shadowBlur = 13 * scale;
  ctx.shadowColor = `rgba(255, 119, 52, ${pulse})`;
  px(ctx, x - 5 * scale, y - 15 * scale, 10 * scale, 3 * scale, "#271529");
  px(ctx, x - 7 * scale, y - 12 * scale, 14 * scale, 25 * scale, "#772c3e");
  px(ctx, x - 5 * scale, y - 9 * scale, 10 * scale, 19 * scale, "#e45242");
  px(ctx, x - 2 * scale, y - 7 * scale, 4 * scale, 15 * scale, "#ffb64e");
  px(ctx, x - 8 * scale, y + 13 * scale, 16 * scale, 3 * scale, "#271529");
  px(ctx, x - 1 * scale, y + 16 * scale, 2 * scale, 9 * scale, "#6a3342");
  ctx.restore();
}

export function drawArenaFrame(ctx, time) {
  ctx.save();
  ctx.globalAlpha = .72;
  px(ctx, 34, 68, 1, 151, "#d45445");
  px(ctx, 445, 68, 1, 151, "#d45445");
  px(ctx, 35, 68, 410, 1, "#e28a4c");
  const pulse = .35 + Math.sin(time * .004) * .12;
  ctx.fillStyle = `rgba(255, 141, 61, ${pulse})`;
  ctx.fillRect(37, 218, 406, 1);
  ctx.restore();
}

export function drawCharacter(ctx, type, x, y, facing, state, time, power = 0, spriteSheet = null) {
  if (spriteSheet?.loaded) {
    drawSpriteFrame(ctx, type, x, y, state, time, spriteSheet);
    return;
  }
  const flip = facing === "left" ? -1 : 1;
  const scale = .66;
  const blink = state === "hurt" && Math.floor(time / 55) % 2 === 0;
  const breath = Math.sin(time * .006 + (type === "muzan" ? 1.2 : 0)) * (state === "idle" || state === "move" ? 1 : .35);
  const death = state === "death";
  const deathT = Math.min(1, time * .0016);

  ctx.save();
  ctx.globalAlpha = blink ? .42 : death ? Math.max(.08, 1 - deathT * .75) : 1;
  ctx.fillStyle = "rgba(0,0,0,.48)";
  ctx.beginPath();
  ctx.ellipse(x, y + 24, type === "tanjiro" ? 16 : 18, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(x, y + (death ? deathT * 16 : breath));
  ctx.scale(flip * scale, scale);
  if (death) ctx.rotate((flip > 0 ? 1 : -1) * deathT * .38);
  if (type === "tanjiro") drawTanjiro(ctx, state, power);
  else drawMuzan(ctx, state, power);
  ctx.restore();
}

const SPRITE_FRAMES = {
  tanjiro: {
    idle: [[0, 0], [1, 0]], move: [[2, 0], [3, 0]], attack: [[0, 1], [0, 1]],
    hurt: [[1, 1], [1, 1]], victory: [[2, 1], [2, 1]], death: [[3, 1], [3, 1]]
  },
  muzan: {
    idle: [[0, 0], [1, 0]], move: [[2, 0], [0, 0]], prepare: [[1, 1], [1, 1]],
    hurt: [[2, 1], [2, 1]], attack: [[2, 1], [2, 1]], death: [[3, 1], [3, 1]]
  }
};

function drawSpriteFrame(ctx, type, x, y, state, time, spriteSheet) {
  const frames = SPRITE_FRAMES[type] ?? SPRITE_FRAMES.tanjiro;
  const choices = frames[state] ?? frames.idle;
  const frame = choices[Math.floor(time / 150) % choices.length];
  const cellW = spriteSheet.naturalWidth / 4;
  const cellH = spriteSheet.naturalHeight / 2;
  const width = type === "muzan" ? 37 : 35;
  const height = type === "muzan" ? 51 : 48;
  const bob = state === "move" ? Math.sin(time * .01) * 2 : Math.sin(time * .006) * .65;
  // Keep the destination rectangle on the logical pixel grid. The canvas is
  // rendered at 4x, so this preserves hard sprite edges after browser scaling.
  const drawX = Math.round(x - width / 2);
  const drawY = Math.round(y - height / 2 + bob);
  ctx.save();
  ctx.globalAlpha = state === "hurt" && Math.floor(time / 55) % 2 === 0 ? .42 : 1;
  ctx.imageSmoothingEnabled = false;
  ctx.shadowColor = type === "tanjiro" ? "rgba(255, 147, 61, .18)" : "rgba(196, 45, 72, .2)";
  ctx.shadowBlur = state === "attack" || state === "prepare" ? 5 : 0;
  ctx.drawImage(spriteSheet, frame[0] * cellW, frame[1] * cellH, cellW, cellH, drawX, drawY, width, height);
  ctx.restore();
}

function drawTanjiro(ctx, state, power) {
  // Boots and legs.
  px(ctx, -9, 5, 7, 19, "#101526");
  px(ctx, 2, 5, 7, 19, "#101526");
  px(ctx, -11, 22, 10, 5, "#4b2b35");
  px(ctx, 1, 22, 10, 5, "#4b2b35");
  px(ctx, -10, 24, 9, 3, "#d59d6e");
  px(ctx, 2, 24, 9, 3, "#d59d6e");

  // Teal-and-black checker haori with angular sleeves.
  poly(ctx, [[-11,-22], [11,-22], [13,2], [8,9], [-9,7], [-13,0]], COLORS.cloth);
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      if ((row + col) % 2 === 0) px(ctx, -11 + col * 5, -20 + row * 5, 5, 5, COLORS.tealDark);
      else px(ctx, -11 + col * 5, -20 + row * 5, 5, 5, COLORS.clothLight);
    }
  }
  px(ctx, -1, -20, 3, 25, "#10172a");
  poly(ctx, [[-12,-18], [-17,-12], [-14,-5], [-9,-10]], COLORS.clothLight);
  poly(ctx, [[10,-18], [16,-13], [14,-6], [9,-10]], COLORS.clothLight);
  px(ctx, -18, -6, 5, 5, COLORS.skin);
  px(ctx, 14, -6, 5, 5, COLORS.skinLight);

  // Collar, neck and face.
  px(ctx, -5, -26, 10, 7, "#7a3943");
  px(ctx, -9, -40, 18, 16, COLORS.skin);
  px(ctx, -8, -38, 4, 11, COLORS.skinLight);
  px(ctx, 6, -37, 3, 8, "#bd7069");
  // Red-black tousled hair.
  poly(ctx, [[-11,-39],[-13,-46],[-8,-44],[-9,-50],[-3,-46],[1,-52],[3,-46],[10,-49],[8,-42],[13,-43],[9,-35],[7,-31],[-8,-31]], COLORS.hair);
  px(ctx, -10, -40, 5, 5, COLORS.hairRed);
  px(ctx, -5, -46, 5, 4, COLORS.hairRed);
  px(ctx, 4, -45, 4, 5, COLORS.hairRed);
  px(ctx, 2, -31, 5, 2, COLORS.hairRed);
  // Face, scar, eye, earrings.
  px(ctx, 4, -35, 3, 2, "#27152a");
  px(ctx, 7, -34, 2, 2, COLORS.ink);
  px(ctx, 5, -38, 3, 1, "#8b3947");
  px(ctx, 8, -26, 3, 5, "#e55444");
  px(ctx, 8, -21, 3, 2, COLORS.gold);
  px(ctx, 10, -20, 1, 3, COLORS.gold);
  // Nichirin sword at the forward side.
  px(ctx, 12, -12, 3, 15, "#55283a");
  px(ctx, 13, -15, 2, 4, COLORS.gold);
  poly(ctx, [[15,-13],[18,-13],[34,-31],[31,-30]], "#e3edf0");
  px(ctx, 30, -31, 5, 2, COLORS.hot);
  if (state === "attack") {
    px(ctx, 13, -15, 3, 4, COLORS.hot);
    poly(ctx, [[15,-17],[18,-18],[34,-33],[31,-31]], "#fff4d0");
    ctx.globalAlpha = .9;
    ctx.strokeStyle = `rgba(255, 186, 68, ${.55 + power * .04})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(18, -10, 24 + power * 1.2, -.92, .26);
    ctx.stroke();
  }
}

function drawMuzan(ctx, state, power) {
  const pulse = Math.sin(power * .8) * .4;
  // Long coat and shoes.
  px(ctx, -9, 5, 7, 20, "#131321");
  px(ctx, 3, 5, 7, 20, "#131321");
  px(ctx, -12, 23, 10, 4, "#060812");
  px(ctx, 1, 23, 11, 4, "#060812");
  poly(ctx, [[-12,-23],[10,-23],[15,7],[9,16],[2,8],[-3,16],[-14,7]], "#1a1727");
  px(ctx, -9, -20, 18, 5, "#3e2339");
  poly(ctx, [[-5,-22],[0,-9],[5,-22]], COLORS.pale);
  px(ctx, -1, -20, 2, 17, "#5c2e43");
  // Hands and long pointed fingers.
  px(ctx, -17, -7, 5, 6, COLORS.pale);
  px(ctx, 13, -8, 5, 6, COLORS.pale);
  px(ctx, -19, -5, 3, 2, COLORS.red);
  px(ctx, 17, -5, 3, 2, COLORS.red);

  // Pale face, black hair and sweeping fringe.
  px(ctx, -9, -41, 18, 18, "#dfe5de");
  px(ctx, -11, -42, 22, 6, COLORS.hair);
  poly(ctx, [[-12,-39],[-15,-35],[-10,-34],[-11,-27],[-5,-31],[-2,-27],[1,-36],[7,-29],[9,-38],[14,-37],[10,-45],[-5,-47]], COLORS.hair);
  px(ctx, -9, -41, 6, 4, "#2a1c2e");
  px(ctx, 4, -41, 4, 4, "#2a1c2e");
  // Eyes and mouth read at small resolution.
  px(ctx, -7, -34, 4, 2, "#c3344a");
  px(ctx, 4, -34, 4, 2, "#c3344a");
  px(ctx, -6, -33, 2, 1, COLORS.ink);
  px(ctx, 5, -33, 2, 1, COLORS.ink);
  px(ctx, -4, -28, 9, 2, "#68233c");
  px(ctx, -2, -27, 5, 1, COLORS.pale);
  // Red pulse marks, and blood aura when preparing.
  px(ctx, -13, -20, 2, 17, "#6b263d");
  px(ctx, 11, -19, 2, 16, "#6b263d");
  if (state === "prepare") {
    ctx.globalAlpha = .45 + pulse * .2;
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -7, 23 + power, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawBloodTendril(ctx, projectile) {
  const originX = projectile.originX ?? projectile.x;
  const tipX = projectile.x;
  const length = Math.max(0, originX - tipX);
  const wave = Math.sin(projectile.age * 25 + projectile.variant * 1.7);
  const step = 12;
  ctx.save();
  ctx.shadowBlur = 7;
  ctx.shadowColor = "#bb304c";
  ctx.lineCap = "square";

  // Muzan's hand and the dark cuff where the steel-blood wire is anchored.
  px(ctx, originX - 5, projectile.y - 7, 8, 14, "#1b1325");
  px(ctx, originX - 9, projectile.y - 4, 7, 8, "#54213a");
  px(ctx, originX - 10, projectile.y - 3, 3, 2, "#d6484e");
  px(ctx, originX - 10, projectile.y + 2, 3, 2, "#9c2b43");

  // A black steel core with a wet red inner thread, both following a slight
  // serpentine wave as the tendril is pulled out and reeled back in.
  ctx.strokeStyle = "#120f1d";
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let x = originX; x >= tipX; x -= step) {
    const y = projectile.y + Math.sin(x * .18 + projectile.age * 18 + projectile.variant) * (1.3 + Math.abs(wave) * .6);
    if (x === originX) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = "#8e263d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = originX; x >= tipX; x -= step) {
    const y = projectile.y + Math.sin(x * .18 + projectile.age * 18 + projectile.variant) * (1.3 + Math.abs(wave) * .6);
    if (x === originX) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Repeating hooked barbs make the weapon read as wire rather than a flat
  // beam. The head gets an extra blood spike and droplets.
  for (let x = originX - 8, i = 0; x > tipX + 7; x -= step, i += 1) {
    const y = projectile.y + Math.sin(x * .18 + projectile.age * 18 + projectile.variant) * (1.3 + Math.abs(wave) * .6);
    const barb = i % 2 === 0 ? -1 : 1;
    ctx.strokeStyle = i % 2 === 0 ? "#d34a4f" : "#6e2037";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 5, y + barb * 6);
    ctx.stroke();
    px(ctx, x - 1, y + barb * 5 - 1, 2, 2, "#e4514b");
  }
  poly(ctx, [[tipX - 11, projectile.y], [tipX + 3, projectile.y - 7], [tipX + 5, projectile.y], [tipX + 3, projectile.y + 7]], "#281322");
  poly(ctx, [[tipX - 7, projectile.y], [tipX + 2, projectile.y - 4], [tipX + 4, projectile.y], [tipX + 2, projectile.y + 4]], "#d4494c");
  px(ctx, tipX - 13, projectile.y - 2, 3, 4, "#ef6a50");
  if (projectile.tipProgress > .25) {
    const dripX = tipX + 4 + Math.sin(projectile.age * 22) * 2;
    const dripY = projectile.y + 6 + (1 - projectile.tipProgress) * 4;
    px(ctx, dripX, dripY, 2, 5, "#b62d46");
    px(ctx, dripX - 1, dripY + 4, 3, 2, "#e34a4b");
  }
  ctx.restore();
}

export function drawSunForm(ctx, projectile, form, intensity = 0) {
  if (!form) return;
  const palette = form.colorPalette ?? [COLORS.hot, COLORS.sun, COLORS.ember];
  const t = projectile.age;
  const spin = t * (5 + form.id * .25);
  const glow = 5 + Math.min(7, intensity * .35);
  ctx.save();
  ctx.globalAlpha = Math.max(.18, 1 - t / Math.max(.5, form.duration) * .5);
  ctx.translate(projectile.x, projectile.y);
  ctx.shadowBlur = glow;
  ctx.shadowColor = palette[1];
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Every Sun Breathing projectile carries a layered flame ribbon. The
  // individual forms below sit on top of this shared fire language, so each
  // hit reads as a sword technique instead of a flat colored projectile.
  const flamePower = .82 + form.id * .055 + intensity * .025;
  drawFlameRibbon(ctx, palette, t, flamePower, form.id >= 11 ? 48 : 31 + form.id * .9);
  drawSunCore(ctx, palette, t, flamePower);
  drawFireSparks(ctx, palette, t, form.id, flamePower);

  if (form.visualType === "crescent") {
    trail(ctx, palette, -28, 0, 18);
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-3, 0, 13 + intensity * .12, -1.15, .72);
    ctx.stroke();
    ctx.strokeStyle = palette[1];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-5, 0, 17, -1.05, .45);
    ctx.stroke();
  } else if (form.visualType === "ring") {
    ctx.rotate(spin);
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = palette[1];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const a = i * Math.PI / 4;
      px(ctx, Math.cos(a) * 19 - 1, Math.sin(a) * 19 - 1, 3, 3, palette[i % palette.length]);
    }
  } else if (form.visualType === "doubleSlash") {
    trail(ctx, palette, -32, 0, 20);
    for (const offset of [-6, 6]) {
      ctx.strokeStyle = palette[offset < 0 ? 0 : 1];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(3, offset, 15, -1.08, .55);
      ctx.stroke();
    }
  } else if (form.visualType === "afterimage") {
    for (let i = 3; i >= 1; i -= 1) {
      ctx.globalAlpha *= .18;
      poly(ctx, [[-9 - i * 8, -12], [0 - i * 8, -15], [8 - i * 8, 10], [-5 - i * 8, 13]], palette[i % palette.length]);
    }
    ctx.globalAlpha *= 5;
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.lineTo(15, -15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, 15);
    ctx.lineTo(23, -8);
    ctx.stroke();
  } else if (form.visualType === "wheel") {
    ctx.rotate(spin);
    ctx.strokeStyle = palette[1];
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i += 1) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(i * Math.PI / 4) * 18, Math.sin(i * Math.PI / 4) * 18);
      ctx.stroke();
    }
    ctx.fillStyle = palette[2];
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (form.visualType === "sunHalo") {
    const points = [];
    for (let i = 0; i < 24; i += 1) {
      const a = i / 24 * Math.PI * 2;
      const r = i % 2 ? 15 : 23;
      points.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    poly(ctx, points, "rgba(255, 157, 53, .42)");
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = palette[2];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 21, 0, Math.PI * 2);
    ctx.stroke();
  } else if (form.visualType === "thrust") {
    trail(ctx, palette, -38, 0, 26);
    poly(ctx, [[20, 0], [-12, -4], [-29, 0], [-12, 4]], palette[0]);
    poly(ctx, [[8, 0], [-12, -2], [-21, 0], [-12, 2]], palette[1]);
    for (let i = 0; i < 5; i += 1) {
      const a = (i - 2) * .28;
      px(ctx, Math.cos(a) * 18 - 1, Math.sin(a) * 18 - 1, 3, 3, palette[i % palette.length]);
    }
  } else if (form.visualType === "wave") {
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = -30; i <= 18; i += 3) {
      const yy = Math.sin(i * .27 + t * 8) * 8;
      if (i === -30) ctx.moveTo(i, yy);
      else ctx.lineTo(i, yy);
    }
    ctx.stroke();
    ctx.strokeStyle = palette[2];
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -28; i <= 14; i += 3) {
      const yy = Math.sin(i * .27 + t * 8 + .7) * 12;
      if (i === -28) ctx.moveTo(i, yy);
      else ctx.lineTo(i, yy);
    }
    ctx.stroke();
  } else if (form.visualType === "sunset") {
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-4, 7, 19, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.strokeStyle = palette[1];
    ctx.beginPath();
    ctx.moveTo(-20, 15);
    ctx.quadraticCurveTo(-4, -4, 15, -18);
    ctx.stroke();
    ctx.strokeStyle = palette[2];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-14, 16);
    ctx.quadraticCurveTo(4, 2, 20, -12);
    ctx.stroke();
  } else if (form.visualType === "radiance") {
    ctx.rotate(spin * .35);
    for (let i = 0; i < 12; i += 1) {
      const a = i / 12 * Math.PI * 2;
      const r1 = 7;
      const r2 = i % 2 ? 20 : 27;
      ctx.strokeStyle = palette[i % palette.length];
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.fillStyle = palette[0];
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (form.visualType === "dragon") {
    ctx.strokeStyle = palette[2];
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-33, 5);
    ctx.bezierCurveTo(-19, -17, -7, 17, 6, -6);
    ctx.bezierCurveTo(15, -20, 20, -8, 24, -1);
    ctx.stroke();
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-31, 3);
    ctx.bezierCurveTo(-18, -14, -6, 14, 6, -5);
    ctx.bezierCurveTo(15, -18, 20, -7, 25, 0);
    ctx.stroke();
    poly(ctx, [[29, 0], [16, -9], [18, 0], [15, 9]], palette[1]);
    px(ctx, 24, -4, 2, 2, COLORS.ink);
    px(ctx, 32, -1, 4, 1, palette[0]);
    px(ctx, -27, 11, 5, 2, palette[3]);
  } else if (form.visualType === "cross") {
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(0, 23);
    ctx.stroke();
    ctx.strokeStyle = palette[2];
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-27, 0);
    ctx.lineTo(28, 0);
    ctx.stroke();
    ctx.strokeStyle = palette[1];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-19, -15);
    ctx.lineTo(19, 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-19, 15);
    ctx.lineTo(19, -15);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFlameRibbon(ctx, palette, time, power, length) {
  ctx.save();
  ctx.globalAlpha *= .94;
  ctx.shadowBlur = 3 + power * 2;
  ctx.shadowColor = palette[1];

  // Hot horizontal sword edge.
  px(ctx, -length, -1, length + 24, 2, palette[2] ?? COLORS.ember);
  px(ctx, -length + 3, -1, length + 18, 1, palette[1] ?? COLORS.sun);

  for (let i = 0; i < 6; i += 1) {
    const x = -length + i * 6;
    const sway = Math.sin(time * 15 + i * 1.65) * (1.2 + i * .25);
    const height = (5 + (i % 3) * 2) * power;
    const width = 5 + (i % 2) * 2;
    flameTongue(ctx, x, sway, height, width, palette[2] ?? COLORS.ember, sway * .6);
    if (i < 5) {
      flameTongue(ctx, x + 1, sway, height * .66, width * .55, palette[1] ?? COLORS.sun, -sway * .35);
      px(ctx, x, sway - Math.round(height * .32), 2, 2, palette[0] ?? COLORS.hot);
    }
  }
  ctx.restore();
}

function flameTongue(ctx, x, y, height, width, color, lean = 0) {
  poly(ctx, [
    [x - width, y + 2],
    [x - width * .48, y - height * .28],
    [x + lean, y - height],
    [x + width * .16, y - height * .4],
    [x + width, y + 2]
  ], color);
}

function drawSunCore(ctx, palette, time, power) {
  const pulse = 1 + Math.sin(time * 18) * .08;
  ctx.save();
  ctx.globalAlpha *= .98;
  ctx.shadowBlur = 6 + power * 3;
  ctx.shadowColor = palette[0] ?? COLORS.hot;
  poly(ctx, [[-12, -5], [-5, -8], [7, -6], [13, 0], [7, 6], [-6, 7], [-13, 1]], palette[2] ?? COLORS.ember);
  poly(ctx, [[-9, -3], [-3, -5], [8, -4], [11, 0], [6, 4], [-5, 5], [-10, 1]], palette[1] ?? COLORS.sun);
  px(ctx, -6, -2, Math.round(12 * pulse), 4, palette[0] ?? COLORS.hot);
  px(ctx, -3, -1, 7, 2, "#fff9d0");
  ctx.restore();
}

function drawFireSparks(ctx, palette, time, formId, power) {
  ctx.save();
  ctx.globalAlpha *= .92;
  for (let i = 0; i < 8; i += 1) {
    const angle = time * (5.5 + formId * .08) + i * 2.43 + formId * .31;
    const distance = 11 + (i % 4) * 6 + power * 2;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance * .62;
    const size = i % 3 === 0 ? 3 : 2;
    px(ctx, x, y, size, size, palette[i % palette.length]);
    if (i % 2 === 0) px(ctx, x - 1, y - 3, 1, 3, palette[0] ?? COLORS.hot);
  }
  ctx.restore();
}

function trail(ctx, palette, fromX, y, length) {
  for (let i = 0; i < 4; i += 1) {
    px(ctx, fromX - i * 5, y + (i % 2 ? 2 : -2), length - i * 5, i === 0 ? 2 : 1, palette[i % palette.length]);
  }
}

export function drawGiftShirt(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(255, 174, 74, .35)";
  poly(ctx, [[-31,-23],[-13,-33],[-4,-26],[4,-26],[13,-33],[31,-23],[23,-10],[17,-14],[17,28],[-17,28],[-17,-14],[-23,-10]], "#e75b47");
  px(ctx, -17, -15, 34, 43, "#ef6a4e");
  px(ctx, -24, -17, 8, 24, "#d74e46");
  px(ctx, 16, -17, 8, 24, "#d74e46");
  px(ctx, -7, -25, 14, 7, "#7c2839");
  px(ctx, -6, -24, 12, 3, "#ffc35d");
  // BOO graphic.
  px(ctx, -10, -3, 20, 14, "#2c1b32");
  px(ctx, -7, 0, 14, 9, "#ffd06b");
  px(ctx, -5, 3, 3, 3, "#2c1b32");
  px(ctx, 2, 3, 3, 3, "#2c1b32");
  px(ctx, -3, 7, 7, 2, "#2c1b32");
  px(ctx, -13, 28, 26, 3, "#8c3541");
  ctx.restore();
}

export function drawGiftTicket(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(65, 209, 180, .32)";
  px(ctx, -39, -24, 78, 48, "#e7c66c");
  px(ctx, -35, -20, 70, 40, "#204b53");
  px(ctx, -31, -15, 62, 30, "#2d6970");
  px(ctx, -28, -13, 56, 2, "#ffd578");
  px(ctx, -28, 11, 56, 2, "#ffd578");
  // Lotus stamp.
  poly(ctx, [[0,7],[-10,3],[-13,-5],[-5,-2],[0,-12],[5,-2],[13,-5],[10,3]], "#f2b654");
  px(ctx, -2, -7, 4, 16, "#f8d77b");
  px(ctx, -22, -6, 13, 2, "#fff0ad");
  px(ctx, -22, -1, 11, 2, "#fff0ad");
  px(ctx, -22, 4, 15, 2, "#fff0ad");
  px(ctx, 13, -6, 13, 2, "#fff0ad");
  px(ctx, 13, -1, 10, 2, "#fff0ad");
  px(ctx, 13, 4, 12, 2, "#fff0ad");
  ctx.restore();
}

export function drawHeart(ctx, x, y, filled = true, scale = 1) {
  const fill = filled ? "#e74b55" : "#3b2639";
  px(ctx, x - 5 * scale, y - 3 * scale, 5 * scale, 5 * scale, fill);
  px(ctx, x, y - 3 * scale, 5 * scale, 5 * scale, fill);
  px(ctx, x - 3 * scale, y + 2 * scale, 6 * scale, 5 * scale, fill);
  px(ctx, x - 1 * scale, y + 7 * scale, 2 * scale, 2 * scale, fill);
  if (filled) {
    px(ctx, x - 3 * scale, y - 2 * scale, 2 * scale, 2 * scale, "#ff9a74");
  }
}

export function drawPixelButton(ctx, rect, label, options = {}) {
  const { hovered = false, accent = "gold", disabled = false } = options;
  const glow = accent === "red" ? "#c9464c" : accent === "teal" ? "#36b8a8" : COLORS.gold;
  ctx.save();
  const lift = hovered ? -2 : 0;
  ctx.shadowBlur = hovered ? 14 : 7;
  ctx.shadowColor = glow;
  px(ctx, rect.x, rect.y + 3 + lift, rect.w, rect.h, "#080b16");
  px(ctx, rect.x + 2, rect.y + lift, rect.w - 4, rect.h - 3, disabled ? "#3a3540" : accent === "red" ? "#6e2d3a" : accent === "teal" ? "#18505a" : "#6d3e36");
  px(ctx, rect.x + 3, rect.y + 2 + lift, rect.w - 6, 2, glow);
  px(ctx, rect.x + 4, rect.y + rect.h - 4 + lift, rect.w - 8, 2, "#1d1a2a");
  ctx.fillStyle = disabled ? "#8d8790" : COLORS.white;
  const labelSize = label.length > 22 ? 7.5 : label.length > 18 ? 8.5 : 10;
  ctx.font = `900 ${labelSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 - 1 + lift);
  ctx.restore();
}

export function drawText(ctx, text, x, y, options = {}) {
  const {
    size = 10, color = COLORS.white, align = "left", weight = 700,
    shadow = true, maxWidth, baseline = "alphabetic", family = "Arial, sans-serif"
  } = options;
  ctx.save();
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (shadow) {
    ctx.fillStyle = "rgba(0,0,0,.62)";
    ctx.fillText(text, x + 1, y + 2, maxWidth);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

export function wrapText(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
  ctx.save();
  ctx.font = `${options.weight ?? 600} ${options.size ?? 9}px ${options.family ?? "Arial, sans-serif"}`;
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      drawText(ctx, line, x, lineY, options);
      line = word;
      lineY += lineHeight;
    } else line = candidate;
  }
  if (line) drawText(ctx, line, x, lineY, options);
  ctx.restore();
  return lineY;
}
