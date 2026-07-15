# SharedLabBookingSystem

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

============================================================

# Shared Lab & Equipment Booking System - Frontend

Frontend của hệ thống **Shared Lab & Equipment Booking System** được phát triển bằng **Angular 22** theo kiến trúc **Feature-based Architecture** kết hợp **Standalone Components**.

---

# Công nghệ sử dụng

| Công nghệ | Mục đích |
|-----------|----------|
| Angular 22 | Frontend Framework |
| TailwindCSS 4 | Xây dựng giao diện |
| Angular Router | Điều hướng |
| ngx-translate | Đa ngôn ngữ (i18n) |
| RxJS | Reactive Programming |
| FullCalendar *(sẽ tích hợp)* | Hiển thị lịch đặt phòng |

---

# Cấu trúc dự án

```text
src
│
├── app
│   ├── core
│   ├── shared
│   └── features
│
├── public
│   └── i18n
│
└── styles.css
```

---

## app/core

Chứa các thành phần xử lý hệ thống.

```text
core
├── auth
├── config
└── http
```

| Thư mục | Chức năng |
|----------|-----------|
| auth | Xử lý xác thực, token |
| config | Cấu hình hệ thống |
| http | Interceptor và xử lý HTTP |

---

## app/shared

Chứa các thành phần dùng chung cho toàn bộ dự án.

```text
shared
├── layout
└── ui
```

### layout

Khung giao diện dùng chung.

```text
layout
├── header
├── footer
└── public-layout
```

Chịu trách nhiệm hiển thị:

- Header
- Footer
- Router Outlet

```text
Header
   │
Router Outlet
   │
Footer
```

---

### ui

Các UI Component tái sử dụng.

```text
ui
├── button
└── logo
```

Nguyên tắc:

- Không viết lại Button nhiều lần.
- Không viết lại Logo nhiều lần.
- Feature chỉ sử dụng Shared UI.

---

## app/features

Chứa các chức năng của hệ thống.

```text
features
├── home
├── auth
└── users
```

Mỗi Feature chịu trách nhiệm một nghiệp vụ riêng.

Feature **không chứa** Header hoặc Footer.

---

## public/i18n

Quản lý đa ngôn ngữ.

```text
public
└── i18n
    ├── vi.json
    └── en.json
```

Toàn bộ nội dung hiển thị trên giao diện phải được lấy từ file ngôn ngữ.

Không hard-code text trực tiếp trong Component.

---

# Frontend Convention

## TailwindCSS

Ưu tiên sử dụng TailwindCSS khi xây dựng giao diện.

Chỉ sử dụng CSS thuần khi Tailwind không đáp ứng.

---

## Màu sắc mặc định

| Thành phần | Tailwind |
|------------|----------|
| Primary | sky-600 |
| Hover | sky-700 |
| Background | slate-50 |
| Surface | white |
| Border | slate-200 |
| Text | slate-900 |
| Text Secondary | slate-500 |
| Success | green-600 |
| Warning | amber-500 |
| Error | red-600 |

---

## Border Radius

| Thành phần | Quy chuẩn |
|------------|-----------|
| Button | rounded-md |
| Card | rounded-xl |
| Input | rounded-md |

---

## Shadow

| Thành phần | Quy chuẩn |
|------------|-----------|
| Card | shadow-sm |
| Dropdown | shadow-md |

---

## Font

Font mặc định:

- Inter

---

## Shared UI

Các component có khả năng tái sử dụng phải đặt trong:

```text
shared/ui
```

Ví dụ:

- Button
- Logo
- Input
- Loading
- Modal

---

## Layout

Mọi trang đều phải hiển thị thông qua:

```text
Public Layout
        │
        ▼
Header
        │
        ▼
Router Outlet
        │
        ▼
Footer
```

Feature không tự tạo Layout riêng nếu chưa có yêu cầu.

---

# Tiến độ hiện tại

## Hoàn thành

- Khởi tạo Angular 22 (Standalone).
- Cấu hình Angular Router.
- Tích hợp TailwindCSS 4.
- Cấu hình PostCSS cho Tailwind.
- Tích hợp ngx-translate.
- Thiết lập cấu trúc thư mục theo Feature-based Architecture.
- Xây dựng Base Layout.
  - Header
  - Footer
  - Public Layout
- Xây dựng Base UI.
  - Button
  - Logo
  - Tích hợp Calendar Library(ở nhánh khác chuẩn bị merge về dev là có)
  - Hoàn thiện Base UI.(sẽ bỏ xung thêm trong tương lai trong quá trình hoàn thiện dự án do thiếu dữ liệu ban đầu)
  - Hoàn thiện Core Routing.(sẽ bỏ xung thêm trong tương lai trong quá trình hoàn thiện dự án do thiếu dữ liệu ban đầu)

---

## Đang thực hiện


---

## Chưa thực hiện

- Home Feature.
- Authentication.
- Laboratory.
- Equipment.
- Booking.
- User Management.

---

# Ghi chú

- Mọi Feature phải sử dụng Shared UI nếu component đã tồn tại.
- Không hard-code chuỗi hiển thị, sử dụng `ngx-translate`.
- Không tự định nghĩa màu sắc ngoài quy chuẩn nếu chưa được thống nhất trong nhóm.
- Ưu tiên TailwindCSS khi phát triển giao diện.