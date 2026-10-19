# SUN BREATHING: THE FINAL GIFT

Mini game đối kháng 2D phong cách anime pixel art, chạy hoàn toàn offline bằng HTML5 Canvas và Web Audio API.

## Chạy game

Không cần cài package. Từ thư mục này, chạy một static server bất kỳ:

```bash
python3 -m http.server 8080
```

Sau đó mở [http://localhost:8080](http://localhost:8080).

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

Nội dung người nhận, lời nhắn và tên quà nằm ở `src/config.js` trong object `GAME_CONFIG`.

Nếu thêm `public/assets/gift-shirt.png` hoặc `public/assets/gift-buffet.png`, game sẽ tự dùng ảnh đó trong overlay quà; nếu không có sẽ dùng minh họa pixel art vẽ bằng Canvas.
