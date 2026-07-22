# Lab & Equipment Booking Frontend

Hệ thống đặt lịch phòng thí nghiệm và thiết bị dùng chung (Frontend). Được xây dựng trên nền tảng **Angular 22** với kiến trúc Standalone, quản lý trạng thái bằng Angular Signals (Zoneless Execution), kết hợp **Tailwind CSS v4** và chuẩn hóa i18n đa ngôn ngữ.

---

## Công nghệ sử dụng

* **Framework:** Angular v22 (Standalone Components, Signals, Zoneless)
* **Language:** TypeScript 6.0 (Strict mode)
* **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
* **Routing:** Angular Router (Lazy Loading, Functional Guards)
* **HTTP & State:** `HttpClient` với Functional Interceptors, State Management dựa trên Signal Store Pattern
* **i18n:** `@ngx-translate/core` v18 (Loader tĩnh từ `/public/i18n`)
* **Unit Testing:** Vitest (thông qua `@angular/build:unit-test`)
* **Containerization:** Docker & Nginx (Multi-stage build)

---

## Hướng dẫn khởi chạy

### Yêu cầu môi trường
* **Node.js:** `>= 22.0.0`
* **npm:** `>= 10.0.0`

### 1. Cài đặt & Chạy Development

```bash
# Cài đặt phụ thuộc
npm install

# Khởi chạy dev server (mặc định http://localhost:4200)
npm start
```

### 2. Kiểm tra mã nguồn & Kiểm thử

```bash
# Chạy Unit Test với Vitest
npm test

# Kiểm tra định dạng code
npm run format:check

# Tự động sửa định dạng code (Prettier)
npm run format
```

### 3. Đóng gói Production

```bash
# Biên dịch ra thư mục dist/frontend/browser
npm run build:prod
```

### 4. Triển khai với Docker

```bash
# Build Docker image
docker build -t lab-booking-frontend .

# Chạy container trên cổng 80
docker run -d -p 80:80 --name lab-booking-app lab-booking-frontend
```

---

## Kiến trúc hệ thống

Dự án áp dụng mô hình phân tách thư mục theo chức năng (Feature-based Architecture), đảm bảo tính cô lập và dễ mở rộng.

```text
src/
├── app/
│   ├── core/                   # Các dịch vụ dùng chung toàn app (Singletons)
│   │   ├── auth/               # Token storage, AuthService, AuthStore (Signals), Guards
│   │   ├── config/             # Re-export có định kiểu cho environment (env.ts)
│   │   └── http/               # Functional Interceptors (Auth, Error) & ApiError class
│   ├── features/               # Các mô-đun chức năng chính (Lazy Loaded)
│   │   ├── auth/               # Trang đăng nhập (login.page.ts)
│   │   ├── home/               # Trang chủ & Landing UI (Hero component)
│   │   ├── users/              # Quản lý người dùng (Store, Service, List Page, Dialog)
│   │   └── not-found/          # Trang lỗi 404
│   ├── shared/                 # Thành phần tái sử dụng
│   │   ├── layout/             # Header, Footer, AppLayout, PublicLayout
│   │   └── ui/                 # UI Primitives (Button, Card, Spinner, Logo)
│   ├── app.config.ts           # Cấu hình Providers toàn hệ thống
│   ├── app.routes.ts           # Định tuyến ứng dụng & Guards
│   └── app.ts                  # Root Component
├── environments/               # Môi trường cấu hình (development / production)
├── public/i18n/                # Các tệp dịch thuật JSON (vi.json, en.json)
└── styles.css                  # Tailwind entry & Design tokens (@theme)
```

---

## Các luồng xử lý chính

### 1. Quản lý trạng thái (State Management)
Không sử dụng các thư viện ngoài như NgRx Redux. Trạng thái ứng dụng được quản lý tập trung thông qua các `@Injectable({ providedIn: 'root' })` Service áp dụng **Signal Store Pattern** (`signal`, `computed`, `asReadonly`). Các Component inject Store và đọc giá trị trực tiếp.

### 2. Xử lý HTTP & Lỗi tập trung
* **`authInterceptor`**: Tự động đính kèm `Authorization: Bearer <token>` vào mọi yêu cầu hướng tới `env.apiBaseUrl`.
* **`errorInterceptor`**: Bắt toàn bộ lỗi HTTP, chuẩn hóa thành đối tượng `ApiError`. Khi gặp lỗi `401 Unauthorized`, hệ thống tự động xóa Session và chuyển hướng về `/auth/login`.

### 3. Điều hướng & Bảo vệ tuyến đường (Guards)
* **`authGuard`**: Ngăn chặn người dùng chưa xác thực truy cập vào các tuyến đường riêng tư (ví dụ: `/users`), tự động lưu lại URL đích qua Query Parameter `redirect`.
* **`guestGuard`**: Ngăn chặn người dùng đã đăng nhập quay lại trang `/auth/login`.

### 4. Đa ngôn ngữ (i18n)
* Ngôn ngữ mặc định: Tiếng Việt (`vi`). Hỗ trợ Tiếng Anh (`en`).
* Tự động nhận diện ngôn ngữ từ `localStorage` hoặc cấu hình trình duyệt người dùng.
* Khởi tạo bản dịch trước khi ứng dụng render đầu tiên (`provideAppInitializer`) để tránh hiện tượng nhấp nháy giao diện (FOUT).

---

## Cấu hình môi trường

Cấu hình môi trường được tách biệt trong `src/environments/` và được truy cập thống nhất qua `src/app/core/config/env.ts`.

| Thuộc tính | Development (`environment.development.ts`) | Production (`environment.ts`) |
| :--- | :--- | :--- |
| `production` | `false` | `true` |
| `apiBaseUrl` | `https://localhost:7080/api` | `https://api.example.com/api` |
| `defaultLocale` | `'vi'` | `'vi'` |
| `supportedLocales` | `['vi', 'en']` | `['vi', 'en']` |

---

## 📜 Quy chuẩn Codebase

* **Formatting:** Định dạng mã nguồn thống nhất bằng **Prettier** (`.prettierrc`).
* **Tailwind v4:** Token thiết kế (màu sắc brand, surface, viền, font) được định nghĩa tập trung trong khối `@theme` tại `src/styles.css`.
* **Web Server:** Sử dụng Nginx được tối ưu hóa cho SPA (`try_files $uri $uri/ /index.html`), bật Gzip và cấu hình Cache-Control tối ưu cho tệp tĩnh.
