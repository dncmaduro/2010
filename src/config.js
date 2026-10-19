export const GAME_CONFIG = {
  title: "SUN BREATHING: THE FINAL GIFT",
  recipient: "em yêu",
  story: "Đánh bại Muzan bằng 12 thức Hơi Thở Mặt Trời để mở khóa món quà bí mật dành cho em!",
  message: "Chúc mừng em yêu! Cảm ơn em đã xuất hiện trong cuộc đời anh. Đây là hai món quà nhỏ dành riêng cho em. Yêu em rất nhiều!",
  gifts: {
    shirt: {
      title: "01 CHIẾC ÁO BOO",
      subtitle: "ÁO BOO",
      asset: "./public/assets/gift-shirt.png"
    },
    buffet: {
      title: "01 VÉ BUFFET MAISON SEN",
      subtitle: "MAISON SEN",
      asset: "./public/assets/gift-buffet.png"
    }
  },
  battle: {
    targetHits: 12,
    playerHearts: 4,
    attackCooldown: 0.48,
    playerSpeed: 112,
    projectileSpeed: 286,
    enemySpeed: 26,
    warningDuration: 0.72,
    invincibility: 1.05
  }
};

export const STAGE = {
  width: 480,
  height: 270,
  hudHeight: 52,
  arenaTop: 66,
  arenaBottom: 245,
  playerX: 92,
  enemyX: 386,
  playerMinY: 96,
  playerMaxY: 216
};
