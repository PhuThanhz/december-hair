<div align="center">

  <img src="december_hair_fe/public/images/logo-transparent.png" alt="December Hair Logo" width="100" />

  # DECEMBER HAIR
  ### 🌿 Modern Premium Hair Salon & Barber Web Platform
  **Praha · Kladno · Mladá Boleslav (Czech Republic)**

  <p align="center">
    <a href="https://december-hair.vercel.app">
      <img src="https://img.shields.io/badge/Live_Demo-december--hair.vercel.app-2e5b44?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js_16-Turbopack-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-Modern_UI-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/GSAP-Motion_%26_Scroll-88ce02?style=flat-square&logo=greensock" alt="GSAP" />
    <img src="https://img.shields.io/badge/FastAPI-Backend_API-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Bilingual-CZ_%2F_EN-darkgreen?style=flat-square" alt="Bilingual" />
  </p>

</div>

---

## 📖 Giới thiệu Dự án

**December Hair** là nền tảng web hiện đại phục vụ chuỗi salon tóc cao cấp tại Cộng hòa Séc (*Praha · Kladno · Mladá Boleslav*). Dự án được xây dựng với triết lý thiết kế **Editorial sang trọng, tone màu xanh rêu – trắng kem tự nhiên**, tối ưu trải nghiệm tương tác mượt mà và tích hợp hệ thống quản trị nội dung (Headless CMS) mạnh mẽ.

---

## ✨ Điểm nhấn & Tính năng nổi bật

### 🖥️ Website Khách hàng (Frontend)
- 🎨 **Visual & Motion cao cấp**: Tích hợp Lenis Smooth Scroll kết hợp GSAP ScrollTrigger mang lại hiệu ứng cuộn trang mượt mà chuẩn studio.
- 🌍 **Đa ngôn ngữ bản địa**: Hỗ trợ song ngữ **Tiếng Séc (CZ)** và **Tiếng Anh (EN)**, chuyển đổi ngôn ngữ liền mạch không tải lại trang.
- 💈 **Bảng giá thông minh & Đặt lịch**: Tự động tính toán tổng chi phí và thời lượng dự kiến theo từng dịch vụ được chọn, hỗ trợ chuyển đổi danh mục nhanh chóng.
- 👨‍👩‍👧‍👦 **"Pro celou rodinu"**: Trải nghiệm tương tác 5 tấm gương chuyên biệt cho từng nhóm đối tượng khách hàng (Nam, Nữ, Trẻ em, Gia đình).
- 📍 **Bản đồ tương tác 3 Chi nhánh**: Định vị trực quan các cơ sở tại Praha, Kladno và Mladá Boleslav, tích hợp ảnh hàng không ČÚZK và chỉ đường Google Maps.
- 🎞️ **Reels & Lookbook Showcase**: Trình diễn các mẫu tóc, video ngắn thực tế từ salon.

### ⚙️ Hệ thống Quản trị (Admin Back-Office)
- 🔐 **Xác thực & Phân quyền**: Quản lý truy cập an toàn theo vai trò (`admin`, `editor`, `branch_manager`).
- 📝 **Live Content Management**: Cập nhật giá dịch vụ, thông tin chi nhánh, banner, hình ảnh lookbook và nội dung văn bản trực tiếp từ giao diện admin.
- ⚡ **Instant On-Demand Revalidation**: Hệ thống tự động kích hoạt Next.js ISR để cập nhật dữ liệu mới lên website khách hàng ngay tức thì.

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Turbopack, Server & Client Components, Partial Prerendering |
| **Styling** | Tailwind CSS, Lucide Icons, Custom Fonts | Noto Serif Display, Inter, Bảng màu chuẩn Brandkit |
| **Hiệu ứng** | GSAP 3, ScrollTrigger, Lenis | Motion fluid, Cinematic reveal, Magnetic button |
| **Bản đồ** | MapLibre GL, Leaflet | Bản đồ định vị chi nhánh, hỗ trợ ảnh vệ tinh ČÚZK |
| **Backend** | FastAPI (Python 3.11+), SQLAlchemy, Pydantic | Kiến trúc RESTful microservice, JWT Authentication |
| **Database** | PostgreSQL | Lưu trữ dữ liệu cấu trúc, logs hoạt động |
| **Deploy** | Vercel (FE) + Docker / VPS (BE) | CI/CD tự động khi push nhánh `main` |

---

## 📂 Cấu trúc Thư mục

```text
december-hair/
├── december_hair_fe/           # Ứng dụng Next.js Frontend & Admin
│   ├── src/
│   │   ├── app/                # Next.js App Router (/(site), /(admin), api)
│   │   ├── admin/              # Components & logic cho hệ thống quản trị (/admin)
│   │   ├── components/         # UI Components (Hero, Services, PriceList, Branches...)
│   │   ├── content/            # Data provider & Fallback local content
│   │   └── lib/                # Utility functions, GSAP animations, formatters
│   ├── public/                 # Static assets (images, videos, logo)
│   └── package.json
│
├── shared-assets/              # Kho tài nguyên gốc (Ảnh nội thất, logo, voucher)
└── README.md                   # Tài liệu dự án
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (Local Development)

### 1. Yêu cầu hệ thống
- **Node.js**: phiên bản `>= 20.x`
- **npm**: phiên bản `>= 10.x`
- **Docker & Docker Compose** (nếu chạy kèm Backend)

### 2. Chạy Frontend độc lập (Mock mode)
*Website có sẵn hệ thống fallback dữ liệu `data.ts`, có thể chạy hoàn chỉnh mà không bắt buộc khởi động Backend.*

```bash
# Di chuyển vào thư mục frontend
cd december_hair_fe

# Cài đặt thư viện
npm install

# Khởi chạy server phát triển
npm run dev
```
🌐 Mở trình duyệt tại: **http://localhost:3004**

### 3. Chạy toàn bộ hệ thống cùng Backend
Repo Backend: [tiendung4411/december_hair_be](https://github.com/tiendung4411/december_hair_be)

```bash
# 1. Khởi động Backend qua Docker
cd december_hair_be
cp .env.example .env
docker compose up -d --build

# Khởi tạo tài khoản quản trị & dữ liệu mẫu
docker compose exec api python -m app.cli create-admin --email admin@decemberhair.cz --name "Admin"
docker compose exec api python -m app.cli seed seed/content.json --public seed/media

# 2. Khởi động Frontend kết nối API
cd ../december_hair_fe
cp .env.example .env.local
# Đặt API_URL=http://localhost:8000/api/v1 trong .env.local
npm run dev
```

---

## 🌿 Quy trình Làm việc & Đóng góp (Git Workflow)

1. **Nhánh `main`**: Nhánh chính thức, tự động build và triển khai trực tiếp lên môi trường Production (Vercel). Vui lòng **không push trực tiếp** vào `main`.
2. **Nhánh tính năng**: Mỗi thành viên tạo nhánh riêng từ `main` (ví dụ: `feature/ten-tinh-nang` hoặc nhánh cá nhân `tiendung`).
3. **Pull Request**: Khi hoàn thành tính năng, tạo Pull Request vào `main` để kiểm tra chất lượng code và review trước khi gộp.
4. **Kiểm tra trước khi commit**:
   ```bash
   cd december_hair_fe
   npm run lint        # Đảm bảo 0 lỗi linting
   npm run build       # Đảm bảo build thành công
   ```

---

<div align="center">

  **December Hair — Kadeřnictví pro ženy, muže i děti**  
  *Crafted with precision & passion.*

</div>
