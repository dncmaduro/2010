export const VIEWPORT = {
  logicWidth: 480,
  logicHeight: 270,
  // Render at 4x internally so the game remains crisp even when the
  // 16:9 canvas is scaled to fill a high-resolution browser window.
  renderScale: 4,
  width: 1920,
  height: 1080
};

export const LOVE_CONFIG = {
  recipient: "Em bé thối",
  sender: "Anh chíp chối",
  shirtGift: "01 chiếc áo BOO",
  buffetGift: "01 vé buffet Maison Sen",
  introStory: "Em bé thối ơi! Anh chíp chối có một thử thách nhỏ dành cho em. Hãy cùng Tanjiro đánh bại Muzan bằng 12 thức Hơi Thở Mặt Trời để mở khóa món quà bí mật nhé! ♥",
  defeatText: "Em bé thối ơi, đừng bỏ cuộc nha! Anh chíp chối tin em sẽ làm được! ♥",
  victoryText: "EM BÉ THỐI CHIẾN THẮNG RỒI! ♥",
  giftTitle: "Chúc mừng em bé thối của anh!",
  giftSubtitle: "Em bé thối đã vượt qua 12 thức Hơi Thở Mặt Trời và đánh bại Muzan rồi!",
  giftIntro: "Anh chíp chối đã chuẩn bị 2 món quà nho nhỏ dành riêng cho em.",
  message: "Em bé thối ơi, cảm ơn em vì đã đến bên anh. Anh chíp chối mong em luôn vui vẻ, hạnh phúc và có thật nhiều kỷ niệm đẹp cùng anh. Yêu em bé thối nhiều lắm! ♥"
};

export const GAME_CONFIG = {
  title: "SUN BREATHING: THE FINAL GIFT",
  story: LOVE_CONFIG.introStory,
  recipient: LOVE_CONFIG.recipient,
  sender: LOVE_CONFIG.sender,
  defeatText: LOVE_CONFIG.defeatText,
  victoryText: LOVE_CONFIG.victoryText,
  gifts: {
    shirt: { title: LOVE_CONFIG.shirtGift, subtitle: "ÁO BOO", asset: "./public/assets/gift-shirt.png" },
    buffet: { title: LOVE_CONFIG.buffetGift, subtitle: "MAISON SEN", asset: "./public/assets/gift-buffet.png" }
  },
  characterSprites: {
    tanjiro: "./public/assets/tanjiro-sprite-sheet.png",
    muzan: "./public/assets/muzan-sprite-sheet.png"
  },
  battle: {
    targetHits: 12,
    playerHearts: 4,
    attackCooldown: 0.65,
    playerSpeed: 146,
    projectileSpeed: 264,
    enemySpeed: 28,
    warningDuration: 0.72,
    invincibility: 1.05
  }
};

export const STAGE = {
  width: VIEWPORT.logicWidth,
  height: VIEWPORT.logicHeight,
  hudHeight: 47,
  arenaTop: 58,
  arenaBottom: 249,
  playerX: 62,
  enemyX: 418,
  playerMinY: 82,
  playerMaxY: 215,
  enemyMinY: 82,
  enemyMaxY: 215
};
