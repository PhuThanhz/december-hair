**Gửi:** tiendung4411@gmail.com
**Tiêu đề:** Mời tham gia dự án website December Hair – hướng dẫn lấy code

Chào Dũng,

Mình đã thêm bạn vào repo GitHub của dự án website **December Hair** (salon tóc ở Praha, Kladno và Mladá Boleslav). Bạn vào email từ GitHub hoặc https://github.com/notifications để **chấp nhận lời mời** trước nhé.

**Thông tin chính**
- Repo: https://github.com/PhuThanhz/december-hair
- Bản đang chạy: https://december-hair.vercel.app
- Code website nằm trong thư mục `december-vintage-barber` (Next.js 16, TypeScript, Tailwind CSS, GSAP, MapLibre)

**Lấy code và chạy trên máy**
```bash
git clone https://github.com/PhuThanhz/december-hair.git
cd december-hair
git checkout tiendung
cd december-vintage-barber
npm install
npm run dev
```
Mở http://localhost:3004 để xem.

**Cách làm việc**
- Nhánh **`tiendung`** là nhánh riêng của bạn. Bạn sửa code và đẩy lên nhánh này:
  ```bash
  git add .
  git commit -m "Mô tả ngắn thay đổi"
  git push
  ```
- **Không đẩy thẳng vào `main`.** Nhánh `main` tự động lên link chính thức gửi khách trên Vercel.
- Khi xong một phần, bạn tạo **Pull Request** từ `tiendung` vào `main` tại https://github.com/PhuThanhz/december-hair/pull/new/tiendung để mình xem rồi gộp vào.
- Mỗi lần đẩy lên nhánh, Vercel sẽ tạo một link xem thử riêng (hiện ngay trong Pull Request), tiện kiểm tra trước khi gộp.
- Trước khi bắt đầu làm mỗi ngày, cập nhật code mới nhất từ `main`:
  ```bash
  git pull origin main
  ```

Có gì chưa rõ bạn cứ nhắn mình nhé.

Cảm ơn bạn,
Phú
