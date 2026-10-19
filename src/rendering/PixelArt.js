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
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
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

export function drawCharacter(ctx, type, x, y, facing, state, time, power = 0) {
  const flip = facing === "left" ? -1 : 1;
  const scale = 2;
  const blink = state === "hurt" && Math.floor(time / 55) % 2 === 0;
  const breath = Math.sin(time * .006 + (type === "muzan" ? 1.2 : 0)) * (state === "idle" || state === "move" ? 1 : .35);
  const death = state === "death";
  const deathT = Math.min(1, time * .0016);

  ctx.save();
  ctx.globalAlpha = blink ? .42 : death ? Math.max(.08, 1 - deathT * .75) : 1;
  ctx.fillStyle = "rgba(0,0,0,.48)";
  ctx.beginPath();
  ctx.ellipse(x, y + 30, type === "tanjiro" ? 22 : 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(x, y + (death ? deathT * 16 : breath));
  ctx.scale(flip * scale, scale);
  if (death) ctx.rotate((flip > 0 ? 1 : -1) * deathT * .38);
  if (type === "tanjiro") drawTanjiro(ctx, state, power);
  else drawMuzan(ctx, state, power);
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

export function drawSunWave(ctx, projectile, intensity = 0) {
  ctx.save();
  const alpha = Math.max(.15, 1 - projectile.age * .18);
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 8 + intensity * 1.5;
  ctx.shadowColor = COLORS.sun;
  ctx.fillStyle = COLORS.hot;
  ctx.beginPath();
  ctx.arc(projectile.x, projectile.y, 7 + Math.sin(projectile.age * 22) * 1.5 + intensity * .25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.sun;
  ctx.beginPath();
  ctx.moveTo(projectile.x - 17, projectile.y);
  ctx.lineTo(projectile.x - 5, projectile.y - 5);
  ctx.lineTo(projectile.x - 2, projectile.y);
  ctx.lineTo(projectile.x - 5, projectile.y + 5);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 3; i += 1) {
    const y = projectile.y + (i - 1) * 7;
    px(ctx, projectile.x - 24 - i * 3, y, 9 + i * 4, 2, i === 1 ? COLORS.hot : COLORS.ember);
  }
  ctx.restore();
}

export function drawBloodSpike(ctx, projectile) {
  ctx.save();
  ctx.shadowBlur = 5;
  ctx.shadowColor = "#be3249";
  ctx.fillStyle = "#711f3b";
  poly(ctx, [[projectile.x + 13, projectile.y], [projectile.x + 1, projectile.y - 7], [projectile.x - 12, projectile.y - 3], [projectile.x - 4, projectile.y], [projectile.x - 13, projectile.y + 4], [projectile.x + 3, projectile.y + 7]], "#70223c");
  px(ctx, projectile.x - 5, projectile.y - 2, 8, 4, COLORS.red);
  px(ctx, projectile.x - 14, projectile.y - 1, 6, 2, "#df4d45");
  px(ctx, projectile.x + 7, projectile.y - 1, 5, 2, "#251328");
  ctx.globalAlpha = .5;
  px(ctx, projectile.x + 17, projectile.y - 2, 18, 2, "#952b45");
  px(ctx, projectile.x + 25, projectile.y - 6, 11, 1, "#c03a48");
  ctx.restore();
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
  ctx.font = "900 10px Arial, sans-serif";
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
