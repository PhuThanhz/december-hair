# DECEMBER HAIR - BỘ 3 BẢN DEMO WEBSITE SALON & BARBERSHOP

Dự án gồm **3 nguồn source Next.js (App Router + TypeScript + Tailwind CSS)** được định hình theo 3 phong cách thiết kế và đối tượng khách hàng khác nhau để trình chiếu cho chủ tiệm chọn lựa.

---

## 💈 1. december-vintage-barber (Port 3001)
- **Phong cách:** Classic Vintage / Luxury Gentlemen Barbershop
- **Tông màu:** Gỗ trầm óc chó, nâu da thuộc, đen nhung, vàng đồng (Amber / Brass Gold).
- **Cảm giác mang lại:** Đẳng cấp, chỉn chu, truyền thống quý ông Âu-Mỹ, uy tín lâu năm.
- **Tính năng nổi bật định hướng:** Menu dịch vụ cạo râu/cắt tóc cổ điển, đặt lịch chọn thợ chuyên môn (Master Barber), hình ảnh retro sang trọng.
- **Khởi chạy:**
  ```bash
  cd december-vintage-barber
  npm run dev
  # Mở tại: http://localhost:3001
  ```

---

## ✨ 2. december-korean-salon (Port 3002)
- **Phong cách:** Modern Minimalist / Korean & Japanese Aesthetic Hair Studio
- **Tông màu:** Trắng ngà (Warm White), Beige, Nâu cát sáng, Xám xi măng nhạt, điểm nhấn pastel tinh tế.
- **Cảm giác mang lại:** Nhẹ nhàng, sạch sẽ, thời thượng kiểu Seoul Salon, phục vụ cả nam & nữ (Uốn phồng, nhuộm trendy, chăm sóc tóc phục hồi).
- **Tính năng nổi bật định hướng:** Bảng giá trong suốt, lookbook kiểu tóc theo mùa (Autumn/Winter Trend), form tư vấn & đặt lịch nhanh.
- **Khởi chạy:**
  ```bash
  cd december-korean-salon
  npm run dev
  # Mở tại: http://localhost:3002
  ```

---

## ⚡ 3. december-urban-edge (Port 3003)
- **Phong cách:** Streetwear / High-Contrast Urban Edge & Gen Z Culture
- **Tông màu:** Deep Dark Mode (#0a0a0a), typography khổ lớn (Bold Brutalist/Industrial), điểm nhấn Neon Acid Lime / Electric Amber.
- **Cảm giác mang lại:** Cá tính, phong cách đường phố, âm nhạc hip-hop/underground, chuyên các kiểu tóc fade sắc nét, uốn con sâu, dreadlock, mullet, tattoo hair.
- **Tính năng nổi bật định hướng:** Thư viện clip/reel ngắn, bảng xếp hạng thợ trẻ, voucher thành viên, đặt lịch trực quan theo ca cắt.
- **Khởi chạy:**
  ```bash
  cd december-urban-edge
  npm run dev
  # Mở tại: http://localhost:3003
  ```

---

## 🚀 Hướng Dẫn Chạy Cả 3 Bản Demo Cùng Lúc
Mỗi source đã được cấu hình sẵn port riêng (3004, 3005, 3006) hoàn toàn không lo trùng lặp cổng:

- Terminal 1: `cd december-vintage-barber && npm run dev` ➔ `http://localhost:3004`
- Terminal 2: `cd december-korean-salon && npm run dev` ➔ `http://localhost:3005`
- Terminal 3: `cd december-urban-edge && npm run dev` ➔ `http://localhost:3006`

---

## 🎨 Tài Nguyên Hình Ảnh & Logo Dùng Chung (`shared-assets/`)
Toàn bộ hình ảnh thực tế từ tiệm đã được xử lý và đồng bộ vào thư mục `public/images/` của cả 3 project để dùng trực tiếp qua đường dẫn `/images/<tên-file>`:

### 🏷️ Bộ Logo Brand:
- `/images/logo.png`: Logo chữ "D" nguyên bản.
- `/images/logo-transparent.png`: Logo chữ "D" tách nền trong suốt (PNG), dùng đặt lên mọi loại background.
- `/images/logo-white.png`: Logo chữ "D" màu trắng tinh tế (dành cho nền tối/tường xanh rêu).
- `/images/logo-gold.png`: Logo chữ "D" ánh kim vàng đồng (dành cho bản Vintage Barber).

### 🏢 Không Gian & Nội Thất Tiệm (Interior & Decor):
- `/images/salon-interior-main.png`: Không gian tiệm góc rộng (tường vòm xanh rêu, bảng hiệu December sáng đèn, gương LED halo).
- `/images/salon-reception.png`: Quầy lễ tân với chữ kim loại nổi "D December" cao cấp.
- `/images/barber-chair-vintage-chrome.png` *(Mới)*: Chiếc ghế cắt tóc Barber cổ điển kim loại mạ chrome sáng bóng, đệm da đen cao cấp trước gương vòm LED.
- `/images/salon-wash-stations.png`: Khu vực giường gội đầu bồn sứ đen cao cấp, vách gạch thông gió xanh rêu.
- `/images/decor-chrome-bear-card.png` *(Mới)*: Tượng gấu Bearbrick tráng gương mạ chrome tinh tế cầm danh thiếp xanh olive của tiệm.
- `/images/decor-lucky-cat.png`: Mèo thần tài may mắn trang trí trên quầy của tiệm.


### ✂️ Dịch Vụ & Tay Nghề Thợ (Services & Stylists):
- `/images/stylist-haircut-action.png`: Thợ cắt tóc chính đang chăm chút kiểu tóc cho khách nam.
- `/images/service-hair-wash-massage.png`: Cận cảnh dịch vụ gội đầu dưỡng sinh & massage thư giãn.
- `/images/treatment-steaming-rinse.png` *(Mới)*: Cận cảnh xả dưỡng, phủ dưỡng & hấp hơi nước phục hồi tóc.
- `/images/service-hair-styling-iron.png`: Cận cảnh kỹ thuật là ép tóc/tạo kiểu bóng mượt chuyên nghiệp.
- `/images/showcase-balayage-curls.png` *(Mới)*: Tác phẩm tóc uốn sóng lơi nhuộm Balayage Blonde cực kỳ sang chảnh.
- `/images/haircut-kid-fade.png`: Ảnh mẫu tóc fade / side-part nam tính cho trẻ em/nam giới.
- `/images/haircut-fade-tattoo-pattern.png` *(Mới)*: Mẫu tóc Taper Fade cạo hoa văn kẻ vạch (Hair Tattoo) phá cách sau gáy.

### 🎟️ Quà Tặng & Dụng Cụ Nghề (Vouchers & Flatlay Tools):
- `/images/voucher-card-1000kc.png` *(Mới)*: Thẻ Voucher / Gift Card sang trọng màu xanh olive dập chìm ánh bạc trị giá 1000 Kč.
- `/images/promo-voucher-3000kc.png`: Banner khuyến mãi / voucher 3000 Kč của tiệm.
- `/images/tools-flatlay-gold-shears.png` *(Mới)*: Ảnh Flatlay nghệ thuật kéo cắt tóc màu vàng đồng, lược carbon chuyên dụng và danh thiếp December.



