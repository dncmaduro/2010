# SUN BREATHING: THE FINAL GIFT

Mini game đối kháng 2D phong cách anime pixel art, chạy hoàn toàn offline bằng HTML5 Canvas và Web Audio API.

Phiên bản hiện tại dùng world resolution 1920×1080 (logic 480×270, render nearest-neighbor 4×), sprite sheet PNG nội bộ cho Tanjiro/Muzan và hệ thống 12 thức tách theo dữ liệu trong `src/sunForms.js`.

## Chạy game

Không cần cài package. Từ thư mục này, chạy một static server bất kỳ:

```bash
python3 -m http.server 8080
```

Sau đó mở [http://localhost:8080](http://localhost:8080).

## Deploy lên Vercel

Project đã có `vercel.json` để ép Vercel phục vụ thư mục gốc. Điều này cần thiết vì project có thư mục `public/` chứa sprite, trong khi `index.html` nằm ở thư mục gốc.

Trong Vercel, đặt **Root Directory** là thư mục chứa file này và để **Framework Preset** là `Other`. Có thể deploy bằng:

```bash
npx vercel --prod
```

Có thể mở trực tiếp `index.html` trong trình duyệt hiện đại, nhưng static server được khuyến nghị để ES Modules hoạt động ổn định.

## Điều khiển

- `W` / `ArrowUp`: di chuyển lên.
- `S` / `ArrowDown`: di chuyển xuống.
- `Space`: Hơi Thở Mặt Trời.
- `P`: tạm dừng.
- `M`: bật/tắt âm thanh.
- `R`: chơi lại.
- `Enter`: bắt đầu từ màn hướng dẫn.

Nút cảm ứng lên/xuống/tấn công sẽ tự xuất hiện trên màn hình nhỏ.

## Tùy biến nhanh

Nội dung người nhận, lời nhắn và tên quà nằm ở `src/config.js` trong object `LOVE_CONFIG`.

Nếu thêm `public/assets/gift-shirt.png` hoặc `public/assets/gift-buffet.png`, game sẽ tự dùng ảnh đó trong overlay quà; nếu không có sẽ dùng minh họa pixel art vẽ bằng Canvas.

Sprite sheet mặc định:

- `public/assets/tanjiro-sprite-sheet.png`
- `public/assets/muzan-sprite-sheet.png`
