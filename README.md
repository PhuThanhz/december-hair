# DECEMBER HAIR — WEBSITE SALON

Website cho salon December Hair (Praha · Kladno · Mladá Boleslav), viết bằng Next.js 16 (App Router + TypeScript + Tailwind CSS), song ngữ CZ / EN.

---

## 💈 december-vintage-barber
- **Phong cách:** editorial xanh rêu – trắng, lấy tông từ tường salon thật.
- **Tính năng chính:** cảnh mở đầu 3 video, "Pro celou rodinu" (5 tấm gương theo từng nhóm khách), bảng giá tự tính tổng tiền & thời gian rồi đặt lịch, lookbook, reels, bản đồ 3 chi nhánh (Mapa / ảnh Letecká ČÚZK, nút Google Maps), poukaz.
- **Khởi chạy:**
  ```bash
  cd december-vintage-barber
  npm install
  npm run dev
  # Mở tại: http://localhost:3004
  ```

---

## ⚙️ backend (FastAPI + PostgreSQL)
Nội dung của site (chi nhánh, dịch vụ, lookbook, reels, text CZ/EN) nằm trong database và được phục vụ qua `GET /api/v1/public/content`. Site đọc API này (cache tag `content`); backend gọi `POST /api/revalidate` của Next sau mỗi lần lưu. Nếu API không chạy, site hiển thị nội dung có sẵn trong `src/app/data.ts`. Chi tiết: [backend/README.md](backend/README.md).

- **Chạy lần đầu (dev):**
  ```bash
  DH_DB_PORT=5433 docker compose -f docker-compose.dev.yml up -d   # Postgres + Mailpit (5433 nếu máy đã có Postgres ở 5432)
  cp backend/.env.example backend/.env                                # sửa DATABASE_URL sang cổng 5433 nếu cần, đặt REVALIDATE_SECRET
  cp december-vintage-barber/.env.example december-vintage-barber/.env.local   # cùng REVALIDATE_SECRET
  cd backend && uv sync && uv run alembic upgrade head
  uv run python -m app.cli seed seed/content.json --public ../december-vintage-barber/public
  uv run fastapi dev app/main.py        # http://localhost:8000/docs
  ```
- **URL:** `/` tiếng Séc, `/en` tiếng Anh, `/cs…` chuyển về `/…`. Ảnh/video CMS nằm ở `/media/…` (dev: Next chuyển tiếp sang backend).

---

## 🎨 Tài Nguyên Hình Ảnh & Logo Dùng Chung (`shared-assets/`)
Toàn bộ hình ảnh thực tế từ tiệm đã được xử lý và đồng bộ vào thư mục `public/images/` của project để dùng trực tiếp qua đường dẫn `/images/<tên-file>`:

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



