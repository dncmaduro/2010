export const SUN_FORMS = [
  {
    id: 1, nameVi: "VIÊN VŨ", nameRomaji: "Enbu", visualType: "crescent", animationId: "crescent_arc",
    duration: 1.9, speed: 264, hitbox: { width: 17, height: 13 },
    particlePreset: "emberArc", colorPalette: ["#ffcf62", "#ff8f3d", "#ef493d"]
  },
  {
    id: 2, nameVi: "BÍCH LA THIÊN", nameRomaji: "Hekira no Ten", visualType: "ring", animationId: "rotating_ring",
    duration: 2.0, speed: 250, hitbox: { width: 22, height: 22 },
    particlePreset: "orbit", colorPalette: ["#fff3ae", "#ffb946", "#f2643c"]
  },
  {
    id: 3, nameVi: "LIỆT NHẬT HỒNG KÍNH", nameRomaji: "Retsujitsu Kōkyō", visualType: "doubleSlash", animationId: "double_slash",
    duration: 1.85, speed: 276, hitbox: { width: 20, height: 20 },
    particlePreset: "double", colorPalette: ["#ffdc76", "#ff6742", "#bd2f45"]
  },
  {
    id: 4, nameVi: "HUYỄN NHẬT HỒNG", nameRomaji: "Gen'nichi Kō", visualType: "afterimage", animationId: "rainbow_afterimage",
    duration: 2.05, speed: 258, hitbox: { width: 18, height: 21 },
    particlePreset: "afterimage", colorPalette: ["#ffefad", "#f27e68", "#7ad1ca", "#d59bd2"]
  },
  {
    id: 5, nameVi: "HỎA XA", nameRomaji: "Kasha", visualType: "wheel", animationId: "fire_wheel",
    duration: 2.1, speed: 230, hitbox: { width: 25, height: 25 },
    particlePreset: "wheel", colorPalette: ["#fff0a3", "#ff9a3c", "#e13c43"]
  },
  {
    id: 6, nameVi: "CHƯỚC CỐT VIÊM DƯƠNG", nameRomaji: "Shakkotsu En'yō", visualType: "sunHalo", animationId: "serrated_sun_halo",
    duration: 2.1, speed: 242, hitbox: { width: 30, height: 25 },
    particlePreset: "halo", colorPalette: ["#fff7bd", "#ffbf4b", "#ee4a3b"]
  },
  {
    id: 7, nameVi: "DƯƠNG HOA ĐỘT", nameRomaji: "Yōkatotsu", visualType: "thrust", animationId: "sunflower_thrust",
    duration: 1.7, speed: 330, hitbox: { width: 28, height: 9 },
    particlePreset: "sunflower", colorPalette: ["#ffe37a", "#ffb03d", "#e24b44"]
  },
  {
    id: 8, nameVi: "PHI LUÂN DƯƠNG VIÊM", nameRomaji: "Hirin Kagerō", visualType: "wave", animationId: "refraction_wave",
    duration: 2.0, speed: 246, hitbox: { width: 27, height: 19 },
    particlePreset: "wave", colorPalette: ["#fff1a5", "#ff9d62", "#9fdac3"]
  },
  {
    id: 9, nameVi: "TÀ DƯƠNG CHUYỂN THÂN", nameRomaji: "Shayō Tenshin", visualType: "sunset", animationId: "sunset_flip",
    duration: 2.05, speed: 240, hitbox: { width: 24, height: 23 },
    particlePreset: "sunset", colorPalette: ["#ffc95b", "#ee5e4e", "#704067"]
  },
  {
    id: 10, nameVi: "HUY HUY ÂN QUANG", nameRomaji: "Kiki Onkō", visualType: "radiance", animationId: "sun_rays",
    duration: 2.0, speed: 252, hitbox: { width: 24, height: 24 },
    particlePreset: "rays", colorPalette: ["#fff9d0", "#ffe57b", "#ff8b42"]
  },
  {
    id: 11, nameVi: "NHẬT VẬN CHI LONG • ĐẦU VŨ", nameRomaji: "Nichiun no Ryū Kaburimai", visualType: "dragon", animationId: "fire_dragon",
    duration: 2.25, speed: 218, hitbox: { width: 34, height: 28 },
    particlePreset: "dragon", colorPalette: ["#fff0a5", "#ff9c3f", "#e34b42", "#a62f47"]
  },
  {
    id: 12, nameVi: "VIÊM VŨ", nameRomaji: "Enbu", visualType: "cross", animationId: "flame_cross",
    duration: 2.4, speed: 224, hitbox: { width: 35, height: 35 },
    particlePreset: "cross", colorPalette: ["#fffde0", "#ffe16a", "#ff7a3d", "#e43a41"]
  }
];

export function getSunForm(index) {
  return SUN_FORMS[Math.max(0, Math.min(SUN_FORMS.length - 1, index))];
}
