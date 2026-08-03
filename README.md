# Lab & Equipment Booking — Frontend

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/)

---

## 📖 Giới thiệu (Overview)

**ShareLab** giúp Sinh viên, Giảng viên, Quản lý Lab, Kỹ thuật viên và Quản trị viên đặt lịch sử dụng phòng thí nghiệm và thiết bị dùng chung trên một nền tảng thống nhất — giúp tối ưu hoá tần suất sử dụng, loại bỏ xung đột lịch trùng, theo dõi trạng thái thiết bị theo thời gian thực và minh bạch hoá quy trình vận hành.

Hệ thống được thiết kế theo kiến trúc hiện đại:
- **Backend:** .NET 10 Web API chuẩn **Clean Architecture** sử dụng mẫu **CQRS** (MediatR), Entity Framework Core 10 (SQL Server), bảo mật bằng **JWT Bearer**.
- **Frontend:** **Angular 22 Standalone Components**, tận dụng **Angular Signals**, **Reactive Forms**, **Tailwind CSS v4** và đa ngôn ngữ tức thời qua **ngx-translate**.

---

## ✨ Tính năng nổi bật (Key Features)

- 🔐 **Xác thực JWT & Phân quyền đa vai trò** — Quản lý truy cập theo vai trò (`Student`, `Lecturer`, `Lab Manager`, `Technician`, `Administrator`).
- 🔑 **Quên / Đặt lại mật khẩu an toàn** — Luồng khôi phục tài khoản qua email chứa link kèm Token ngẫu nhiên (Hex 64 ký tự), tự động hết hạn sau 1 giờ.
- 🛡️ **Chính sách Mật khẩu Fluent & 2 Lớp** — Đảm bảo mật khẩu mạnh thông qua bộ kiểm tra xích (Fluent API Validation) ở Client và `UserService` ở Server.
- 📅 **Đặt phòng & Thiết bị thông minh** — Tra cứu trạng thái rảnh/bận theo thời gian thực, đặt chỗ theo khung giờ linh hoạt, ngăn ngừa việc đặt trùng lặp.
- 📊 **Thống kê & Dashboard trực quan** — Theo dõi chỉ số hoạt động, tần suất đặt chỗ và hiệu suất khai thác thiết bị.
- 🌐 **Đa ngôn ngữ (i18n)** — Hỗ trợ Tiếng Việt (`vi`) và Tiếng Anh (`en`), chuyển đổi ngôn ngữ tức thời.
- 🎨 **Giao diện hiện đại & Linh hoạt** — Thiết kế Tailwind CSS v4 Responsive (Mobile-first), thành phần UI chuẩn mực SaaS.

---

## 🏗️ Kiến trúc & Công nghệ (Architecture & Tech Stack)

### Tech Stack Chi Tiết

| Tầng | Công nghệ & Thư viện |
|---|---|
| **Backend API** | .NET 10, ASP.NET Core Web API, Entity Framework Core 10 |
| **Backend Architecture** | Clean Architecture (`Domain` → `Application` → `Infrastructure` → `API`), CQRS với MediatR, AutoMapper, FluentValidation, Swashbuckle (Swagger) |
| **Frontend Framework** | Angular 22 (Standalone Components, Angular Signals, RxJS, Reactive Forms) |
| **Giao diện & UI** | Tailwind CSS v4, Custom Design Tokens, CSS Paged Media |
| **Đa ngôn ngữ (i18n)** | `@ngx-translate/core` + `@ngx-translate/http-loader` (`vi`, `en`) |
| **Testing & Scripting** | Vitest, Node.js Automation Scripts (`open-browser.js`), Docker & Nginx |

---


## Quick start
npm start          # http://localhost:4200
Log in with an account issued by the backend, then open **Users**.
## Scripts
| Script | Purpose |
|---|---|
| `npm start` | Dev server (`ng serve`) at :4200 |
| `npm run build` | Production build to `dist/frontend/browser` |
| `npm run build:prod` | Same, explicit production configuration |
| `npm run watch` | Rebuild on change (development config) |
| `npm test` | Vitest via `ng test` |
| `npm run format` / `format:check` | Prettier |
## Architecture

Standalone components throughout — **no NgModules**. State is held in
**Signals-based store services**; UI reads signals directly and Angular's
change detection reacts automatically. No `zone.js`.

### Folder structure

## 📁 Cấu trúc thư mục dự án (Project Structure)

```text
sharelab/
├── public/                     # Static Assets & Files i18n
│   ├── i18n/                   # File dịch thuật đa ngôn ngữ (en.json, vi.json)
│   └── favicon.ico
├── scripts/                    # Automation Scripts
│   ├── config.js               # Cấu hình địa chỉ Client Local
│   └── open-browser.js         # Tự động mở trình duyệt khi khởi chạy
├── src/                        # Angular Frontend App
│   ├── app/
│   │   ├── core/               # Auth, Interceptors, Config, Guards, Stores
│   │   │   ├── auth/           # AuthService, AuthStore, FluentPasswordValidator, TokenStorage
│   │   │   ├── config/         # Environment App configurations
│   │   │   └── http/           # ApiError, AuthInterceptor, ErrorInterceptor
│   │   ├── features/           # Feature Modules (Pages & Components)
│   │   │   ├── auth/           # Login, Forgot-Password, Reset-Password pages
│   │   │   ├── dashboard/      # Dashboard sau đăng nhập
│   │   │   ├── home/           # Landing Page (Hero, About, Feature, Workflow, Statistics, Preview, CTA)
│   │   │   ├── users/          # Quản lý tài khoản người dùng
│   │   │   └── not-found/      # Trang 404
│   │   └── shared/             # Components UI tái sử dụng (Button, Card, Logo, Layouts)
│   ├── environments/           # File cấu hình môi trường Development/Production
│   ├── main.ts                 # Entry point Angular App
│   └── styles.css              # Global styles & Tailwind CSS setup
├── SharedLabAndEquipmentBookingSystem/ # Backend API (.NET 10 Clean Architecture)
│   ├── Domain/                 # Entities, Enums, Value Objects
│   ├── Application/            # CQRS Commands/Queries, Services, Interfaces, DTOs
│   ├── Infrastructure/         # EF DbContext, Repositories, JWT Services, Email Sender
│   └── API/                    # ASP.NET Core Web API Controllers, Middlewares, Program.cs
├── Dockerfile                  # Cấu hình Docker build cho Frontend/Backend
├── nginx.conf                  # Cấu hình Web Server Nginx cho Production deployment
├── package.json
└── README.md

```

---
### State management

State lives in `@Injectable({ providedIn: 'root' })` services that expose
`signal`/`computed` values and async methods — the native-Signals
equivalent of an NgRx SignalStore. See `core/auth/auth.store.ts` and
`features/users/users.store.ts`.

### HTTP layer (`core/http/`)

Two functional interceptors registered in `app.config.ts`:

- `authInterceptor` — attaches `Authorization: Bearer <token>` to requests
  targeting `env.apiBaseUrl`.
- `errorInterceptor` — on `401` clears the session and routes to
  `/auth/login`; normalizes every failure to an **`ApiError`**
  (`status`, `message`, `code`, `details`).
### Auth & guards
`core/auth/auth.guard.ts` exports `authGuard` (protects `/users`, redirects
to `/auth/login?redirect=…`) and `guestGuard` (keeps signed-in users off
`/auth/login`). `core/auth/auth.service.ts` calls the real backend
(`POST {apiBaseUrl}/auth/login`); `AuthStore` owns the session
side-effects (token storage, current-user signal, `roles`).

### i18n

`@ngx-translate/core` (v18, function-based providers) with the HTTP loader
reading `public/i18n/{lang}.json` (copied to the site root at build time).
Default locale is `vi`. `app.config.ts` uses `provideAppInitializer` to
load the initial locale before first paint.

### Styling

Tailwind v4 via PostCSS (`.postcssrc.json` → `@tailwindcss/postcss`). The
global entry is `src/styles.css`; design tokens (brand palette, surface
colors, card radius/shadow) live in the `@theme` block.

## Testing

Angular 22's `@angular/build:unit-test` builder runs **Vitest**. Examples:
`src/app/app.spec.ts`, `src/app/shared/ui/button.spec.ts`. Run `npm test`.

## Configuration

Swapped by `fileReplacements` in `angular.json` (dev build uses
`environment.development.ts`). Access via `core/config/env.ts`.

| Field | Dev | Prod |
|---|---|---|
| `apiBaseUrl` | `https://localhost:7080/api` | `https://api.example.com/api` |
| `defaultLocale` | `vi` | `vi` |
| `supportedLocales` | `['vi','en']` | `['vi','en']` |
## Docker
```bash
docker build -t lab-booking-frontend .
docker run -p 8080:80 lab-booking-frontend
```
Multi-stage build (Node → nginx). Build output is `dist/frontend/browser`
(Angular application builder), which the Dockerfile copies into nginx.

---

## 🤝 Quy trình Đóng góp (Contributing Guidelines)

1. **Tạo nhánh (Branch):**
* Tính năng mới: `feature/<ten-tinh-nang>`
* Sửa lỗi: `fix/<ten-loi>`


2. **Quy chuẩn Commit:** Độc lập theo chuẩn [Conventional Commits](https://www.conventionalcommits.org/):
* `feat:` Tính năng mới
* `fix:` Sửa lỗi
* `refactor:` Cải tiến cấu trúc mã nguồn
* `docs:` Cập nhật tài liệu


3. Tạo **Pull Request (PR)** kèm mô tả chi tiết và gắn mã Issue tương ứng.

---

## 📄 Giấy phép (License)

Dự án được phát hành theo giấy phép open-source **[MIT License](https://www.google.com/search?q=LICENSE)**.
