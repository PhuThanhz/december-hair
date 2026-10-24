<div align="center">

  <img src="december_hair_fe/public/images/logo-transparent.png" alt="December Hair Logo" width="88" />

  # DECEMBER HAIR
  ### Enterprise Web Platform & Headless CMS Architecture
  **Praha · Kladno · Mladá Boleslav — Czech Republic**

  <p align="center">
    <a href="https://december-hair.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Production-december--hair.vercel.app-1e3a2b?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Production" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Framework-Next.js_16_(Turbopack)-black?style=flat-square&logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/Language-TypeScript_5-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Styling-Tailwind_CSS_v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Motion-GSAP_3_%2B_Lenis-88ce02?style=flat-square" alt="GSAP & Lenis" />
    <img src="https://img.shields.io/badge/Backend-FastAPI_(REST)-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Database-PostgreSQL_16-4169e1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Localization-i18n_(CZ_%2F_EN)-2d6a4f?style=flat-square" alt="Localization" />
  </p>

</div>

---

## 1. Tổng quan Dự án

**December Hair** là giải pháp nền tảng web thương mại dịch vụ cao cấp dành cho chuỗi salon tóc chuẩn quốc tế tại Cộng hòa Séc, bao gồm ba cơ sở vận hành thực tế tại **Praha**, **Kladno** và **Mladá Boleslav**.

Dự án áp dụng mô hình kiến trúc tách rời (**Decoupled Headless Architecture**):
* **Frontend Client & Management Suite (`december_hair_fe`)**: Xây dựng trên nền tảng Next.js 16 App Router kết hợp React 19, tối ưu hóa rendering hiệu năng cao với Turbopack và Partial Prerendering (PPR).
* **Backend API & Data Engine (`december_hair_be`)**: Microservice xây dựng bằng Python FastAPI kết hợp PostgreSQL, quản lý toàn bộ nghiệp vụ dịch vụ, danh mục sản phẩm, truyền thông và kiểm soát truy cập người dùng.

---

## 2. Kiến trúc Kỹ thuật & Năng lực Hệ thống

### Giao diện Khách hàng (Client-Facing Application)
* **Editorial Design System**: Ngôn ngữ thiết kế tối giản, bảng màu lấy cảm hứng từ nhận diện thực tế của salon (tone xanh rêu tự nhiên, nền kem ấm và điểm nhấn kim loại mạ chrome). Kiểu chữ nghệ thuật *Noto Serif Display* kết hợp typographic grid tiêu chuẩn xuất bản.
* **Hardware-Accelerated Motion**: Tích hợp **Lenis Smooth Scroll** và **GSAP ScrollTrigger**, đồng bộ hóa chuyển động cuộn trang (inertia scroll, curtain reveal, pinned horizontal showcase) đạt tần số quét 60/120 FPS.
* **Công cụ Tính toán Chi phí & Thời lượng Dịch vụ**: Hệ thống client-side state engine cho phép người dùng lựa chọn đa dịch vụ, tính toán tức thì chi phí (CZK) cùng thời lượng dự kiến, liên kết trực tiếp module đặt lịch hẹn.
* **Bản đồ Địa lý Đa chế độ (Geospatial Mapping)**: Hiển thị định vị 3 chi nhánh với công nghệ MapLibre Vector Tiles kết hợp ảnh chụp hàng không trực diện từ cơ sở dữ liệu địa chính quốc gia Séc (**ČÚZK Letecká ortofotomapa**).
* **Kiến trúc Bản địa hóa Toàn diện (i18n)**: Hỗ trợ song ngữ Tiếng Séc (mặc định) và Tiếng Anh; tối ưu SEO đa vùng lãnh thổ (hreflang, metadata động, OpenGraph đa kích thước).

### Hệ thống Quản trị Vận hành (Headless Back-Office)
* **Kiểm soát Truy cập Dựa trên Vai trò (RBAC)**: Phân quyền phân cấp rõ ràng (`admin`, `editor`, `branch_manager`), bảo vệ phiên làm việc qua JWT mã hóa an toàn.
* **Live Content Orchestration**: Quản trị danh mục dịch vụ, thời gian mở cửa linh hoạt theo từng chi nhánh, thư viện media đa phương tiện và toàn bộ kho từ điển bản địa hóa.
* **Cơ chế Đồng bộ Dữ liệu Tức thì (On-Demand ISR)**: Tự động kích hoạt Webhook `POST /api/revalidate` xóa cache phân đoạn trên Next.js ngay khi quản trị viên phát hành thay đổi, đảm bảo tốc độ phản hồi 0-latency cho người dùng cuối.
* **Khả năng Chống chịu Sự cố (Zero-Downtime Fallback)**: Tích hợp hệ thống fallback tĩnh `data.ts`, cho phép website phục vụ khách hàng liên tục ngay cả khi dịch vụ backend ngoại tuyến hoặc bảo trì.

---

## 3. Ngăn xếp Công nghệ (Tech Stack)

| Phân tầng | Công nghệ | Mục đích ứng dụng |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 16 (Turbopack, App Router) | SSR, SSG, Partial Prerendering, Edge Caching |
| **Core Language** | TypeScript 5 (Strict Mode) | Định kiểu dữ liệu toàn vẹn giữa client và server |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons | Utility-first styling, responsive responsive grid |
| **Motion & Scroll** | GSAP 3, ScrollTrigger, Lenis | Điều phối hiệu ứng chuyển động và quán tính cuộn trang |
| **Mapping Engine** | MapLibre GL, Leaflet, ČÚZK API | Trực quan hóa dữ liệu địa lý và định vị chi nhánh |
| **State & Fetching**| TanStack Query v5, Native Fetch | Client cache synchronization, optimistic mutations |
| **Backend Service** | FastAPI (Python 3.11+), Pydantic v2 | High-performance asynchronous REST API |
| **Database** | PostgreSQL 16, SQLAlchemy ORM | Cơ sở dữ liệu quan hệ, ACID compliance |
| **Deployment** | Vercel Edge Network, Docker Engine | Phân phối nội dung toàn cầu, containerization |

---

## 4. Cấu trúc Dự án

```text
december-hair/
├── december_hair_fe/           # Ứng dụng Frontend & Bảng điều khiển Admin
│   ├── src/
│   │   ├── app/                # App Router (/(site) khách hàng, /(admin) quản trị, /api)
│   │   ├── admin/              # Module quản trị: UI Shell, Forms, RBAC, API Client
│   │   ├── components/         # Atomic UI Components (Hero, Services, PriceList, Map...)
│   │   ├── content/            # Data Provider, hooks kết nối CMS & local fallback
│   │   └── lib/                # Utility modules, GSAP configs, formatters
│   ├── public/                 # Tài nguyên tĩnh tối ưu hóa (Media, WebP, SVG, Fonts)
│   ├── scripts/                # Tự động hóa trích xuất và đồng bộ dữ liệu mẫu (Seed export)
│   └── package.json
│
├── shared-assets/              # Kho tư liệu hình ảnh gốc, nhận diện thương hiệu
└── README.md                   # Tài liệu kỹ thuật dự án
```

---

## 5. Hướng dẫn Khởi chạy Môi trường Phát triển (Local Setup)

### Yêu cầu Tiên quyết
* Node.js `>= 20.x` & npm `>= 10.x`
* Python `>= 3.11` & Docker Compose (tùy chọn khi chạy trọn vẹn cả Backend)

### Khởi động Frontend Độc lập (Standalone Mode)
Hệ thống tích hợp sẵn nguồn dữ liệu tĩnh dự phòng, cho phép phát triển giao diện hoàn toàn độc lập:

```bash
# 1. Truy cập thư mục frontend
cd december_hair_fe

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3004`

### Khởi động Đồng bộ với Backend API
Kho lưu trữ Backend: [tiendung4411/december_hair_be](https://github.com/tiendung4411/december_hair_be)

```bash
# 1. Khởi động hạ tầng backend qua Docker
cd december_hair_be
cp .env.example .env
docker compose up -d --build

# Khởi tạo quản trị viên và nạp dữ liệu hạt giống (Seed)
docker compose exec api python -m app.cli create-admin --email admin@decemberhair.cz --name "Admin"
docker compose exec api python -m app.cli seed seed/content.json --public seed/media

# 2. Kết nối và khởi chạy frontend
cd ../december_hair_fe
cp .env.example .env.local
# Cấu hình API_URL=http://localhost:8000/api/v1 trong file .env.local
npm run dev
```

---

## 6. Tiêu chuẩn Kỹ thuật & Quy trình Git (Workflow)

Nhằm đảm bảo tính ổn định tối đa cho môi trường Production, quy trình đóng góp mã nguồn tuân thủ các quy tắc nghiêm ngặt:

1. **Nhánh `main` (Production Branch)**: Tự động kích hoạt quy trình CI/CD triển khai trực tiếp lên hạ tầng Vercel Production. Nghiêm cấm push trực tiếp mã nguồn vào nhánh `main`.
2. **Feature Branching**: Toàn bộ tính năng hoặc bản sửa lỗi mới phải được thực hiện trên nhánh độc lập tạo từ `main`.
3. **Kiểm tra Chất lượng Code Trước Khi Tạo Pull Request**:
   ```bash
   cd december_hair_fe
   npm run lint        # Bắt buộc đạt 0 lỗi (Zero ESLint Errors)
   npm run build       # Bắt buộc biên dịch thành công toàn bộ 25 static/dynamic routes
   ```
4. **Code Review**: Mọi Pull Request cần được rà soát và xác nhận kiểm thử trước khi tiến hành merge vào nhánh chính.

---

<div align="center">

  **December Hair — Kadeřnictví pro ženy, muže i děti**  
  *Designed and engineered with precision.*

</div>
