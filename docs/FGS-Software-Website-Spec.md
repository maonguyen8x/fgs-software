# FGS Software — Website Project Specification

> Tài liệu mô tả đầy đủ yêu cầu xây dựng website công ty FGS Software.  
> Dùng để hướng dẫn GitHub Copilot / AI coding assistant triển khai toàn bộ dự án.

---

## 1. Tổng quan dự án

| Mục | Nội dung |
|-----|----------|
| **Tên công ty** | FGS Software |
| **Lĩnh vực** | IT Outsourcing — phát triển phần mềm theo yêu cầu |
| **Thị trường mục tiêu** | Khách hàng và đối tác Nhật Bản |
| **Mục tiêu website** | Giới thiệu công ty, dịch vụ, team kỹ thuật; thu hút đối tác/khách hàng Nhật; nhận yêu cầu liên hệ hợp tác |
| **Ngôn ngữ hiển thị** | Tiếng Anh (chính) + Tiếng Nhật (日本語) + Tiếng Việt (phụ) |
| **Phong cách thiết kế** | Professional, modern, clean — phù hợp thị hiếu người Nhật: tối giản, đáng tin cậy, chi tiết rõ ràng |

---

## 2. Công nghệ được chọn

### 2.1 Tech Stack khuyến nghị

```
Frontend:   Next.js 14+ (App Router) + TypeScript
Styling:    Tailwind CSS + shadcn/ui
CMS/Admin:  Payload CMS (self-hosted, built-in admin panel)
Database:   PostgreSQL (hoặc MongoDB tùy host)
Email:      Resend (hoặc Nodemailer + Gmail SMTP)
Auth:       NextAuth.js (JWT, cho admin login)
Deploy:     Vercel (frontend + API) + Supabase (PostgreSQL)
```

### 2.2 Lý do chọn

| Công nghệ | Lý do |
|-----------|-------|
| **Next.js** | Full-stack trong 1 project, SEO tốt (SSR/SSG), deploy dễ lên Vercel |
| **TypeScript** | An toàn kiểu dữ liệu, dễ maintain lâu dài |
| **Tailwind CSS** | Build UI nhanh, responsive dễ, không cần CSS file riêng |
| **Payload CMS** | Admin panel tích hợp sẵn, CRUD team/nội dung không cần code thêm |
| **Resend** | Gửi email chuyên nghiệp, free tier 3.000 email/tháng, API đơn giản |
| **Vercel** | Deploy Next.js cực nhanh, free tier ổn cho giai đoạn đầu, CI/CD tự động |
| **Supabase** | PostgreSQL free tier, dễ dùng, có realtime nếu cần sau này |

### 2.3 Cấu trúc thư mục dự án

```
fgs-software/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (site)/             # Public pages
│   │   │   ├── page.tsx        # Home
│   │   │   ├── about/
│   │   │   ├── services/
│   │   │   ├── team/
│   │   │   ├── works/
│   │   │   ├── blog/
│   │   │   └── contact/
│   │   ├── (admin)/            # Admin dashboard (protected)
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   │       ├── team/
│   │   │       ├── services/
│   │   │       ├── works/
│   │   │       └── blog/
│   │   └── api/
│   │       ├── contact/        # POST: nhận form → gửi email
│   │       ├── auth/           # NextAuth handlers
│   │       └── admin/          # CRUD APIs (protected)
│   ├── components/
│   │   ├── layout/             # Header, Footer, Nav
│   │   ├── sections/           # Hero, About, Services, Team...
│   │   ├── ui/                 # Button, Card, Form, Modal...
│   │   └── admin/              # AdminLayout, DataTable, FormEditor
│   ├── lib/
│   │   ├── db.ts               # Prisma / DB client
│   │   ├── email.ts            # Resend email sender
│   │   ├── auth.ts             # NextAuth config
│   │   └── utils.ts
│   ├── types/                  # TypeScript interfaces
│   └── middleware.ts           # Auth guard cho /admin routes
├── prisma/
│   └── schema.prisma
├── public/
│   ├── images/
│   └── fonts/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 3. Sitemap & Các trang

### 3.1 Public Pages

```
/                   → Redirect tự động theo ngôn ngữ trình duyệt
/en/                → Trang chủ tiếng Anh
/ja/                → Trang chủ tiếng Nhật (日本語)
/vi/                → Trang chủ tiếng Việt
/en/about           → Giới thiệu công ty
/en/services        → Dịch vụ & năng lực kỹ thuật
/en/team            → Đội ngũ thành viên
/en/works           → Dự án / Portfolio
/en/blog            → Blog kỹ thuật (tùy chọn giai đoạn sau)
/en/contact         → Liên hệ (form gửi email)
(tương tự cho /ja/... và /vi/...)
```

### 3.2 Admin Pages (protected, yêu cầu đăng nhập)

```
/admin/login        → Đăng nhập admin
/admin/dashboard    → Tổng quan
/admin/team         → Quản lý thành viên (CRUD)
/admin/services     → Quản lý dịch vụ (CRUD)
/admin/works        → Quản lý portfolio/dự án (CRUD)
/admin/blog         → Quản lý bài viết blog (CRUD)
/admin/messages     → Xem danh sách tin nhắn từ form liên hệ
/admin/settings     → Cài đặt chung (tên công ty, email, mạng xã hội)
```

---

## 4. Chi tiết từng trang (Public)

### 4.1 Trang chủ — `/`

**Sections theo thứ tự:**

1. **Hero Section**
   - Headline chính: "Your Trusted IT Outsourcing Partner in Vietnam"
   - Subheadline: "We build high-quality software for Japanese businesses"
   - 2 CTA buttons: "Get in Touch" → `/contact` | "View Our Work" → `/works`
   - Background: gradient hoặc animation nhẹ (không quá rối)

2. **Stats Bar**
   - Số năm kinh nghiệm, số dự án, số khách hàng, công nghệ sử dụng
   - Hiển thị số đếm animation khi scroll vào

3. **Services Overview** (3–4 card)
   - Tóm tắt các dịch vụ chính, link → `/services`

4. **Why Choose Us**
   - 4–6 điểm nổi bật: kinh nghiệm Nhật Bản, giao tiếp tốt, chất lượng, linh hoạt...

5. **Featured Team** (3–4 thành viên nổi bật)
   - Avatar, tên, role, link → `/team`

6. **Featured Works** (2–3 dự án)
   - Thumbnail, tên, tech stack, link → `/works`

7. **Testimonials** (nếu có)
   - Quote từ khách hàng, tên, công ty

8. **CTA Banner**
   - "Ready to start your project?" + button liên hệ

9. **Footer**
   - Logo, menu, mạng xã hội, copyright

---

### 4.2 Giới thiệu — `/about`

**Nội dung:**
- Lịch sử thành lập và tầm nhìn công ty
- Mission & Vision
- Giá trị cốt lõi (Core Values): 4–6 điểm
- Tại sao chọn FGS Software (đặc biệt với khách hàng Nhật)
- Photo/illustration của team
- Timeline thành lập và các mốc quan trọng

---

### 4.3 Dịch vụ — `/services`

**Các dịch vụ cần trình bày:**

| Dịch vụ | Mô tả |
|---------|-------|
| Web Application Development | Phát triển web app theo yêu cầu |
| Mobile App Development | iOS / Android / Cross-platform (React Native, Flutter) |
| API Development & Integration | REST API, GraphQL, third-party integration |
| UI/UX Design | Thiết kế giao diện, prototype, user testing |
| Code Review & Consulting | Review code, tư vấn kiến trúc hệ thống |
| Maintenance & Support | Bảo trì, vá lỗi, nâng cấp hệ thống |

**Mỗi dịch vụ hiển thị:**
- Icon + Tên dịch vụ
- Mô tả ngắn
- Danh sách công nghệ liên quan
- CTA liên hệ

**Tech Stack Section:**
- Nhóm theo loại: Frontend, Backend, Mobile, Database, DevOps, Tools
- Hiển thị logo + tên công nghệ dạng grid hoặc badge

---

### 4.4 Đội ngũ — `/team`

**Hiển thị:**
- Grid card mỗi thành viên
- Mỗi card gồm:
  - Avatar (ảnh upload)
  - Họ tên
  - Chức danh / Role
  - Số năm kinh nghiệm
  - Các kỹ năng chính (tag/badge)
  - Mô tả ngắn
  - Link LinkedIn, GitHub (tùy chọn)

**Lưu ý:** Dữ liệu team được quản lý từ Admin Panel → thêm/sửa/xóa không cần sửa code.

---

### 4.5 Portfolio / Works — `/works`

**Hiển thị:**
- Filter theo: All / Web / Mobile / API / Other
- Mỗi dự án (card):
  - Thumbnail/screenshot
  - Tên dự án
  - Mô tả ngắn
  - Tech stack (badge)
  - Loại dự án
  - Link xem chi tiết (trang riêng `/works/[slug]`)

**Trang chi tiết dự án `/works/[slug]`:**
- Mô tả chi tiết
- Vấn đề → Giải pháp → Kết quả
- Ảnh màn hình (gallery)
- Tech stack đầy đủ
- Thời gian thực hiện
- Link demo / GitHub (nếu public)

---

### 4.6 Liên hệ — `/contact`

**Form liên hệ gồm:**

```
Họ tên (*)          → input text
Email (*)           → input email, validation
Tên công ty         → input text
Số điện thoại       → input tel
Loại dự án          → select: Web App / Mobile App / API / Tư vấn / Khác
Ngân sách dự kiến   → select: < $5K / $5K–$15K / $15K–$50K / > $50K / Chưa xác định
Mô tả yêu cầu (*)  → textarea, tối thiểu 20 ký tự
Đính kèm file       → input file (pdf, doc, max 5MB) — tùy chọn
```

**Xử lý khi submit:**
1. Validate phía client (React Hook Form + Zod)
2. Gọi `POST /api/contact`
3. Server validate lại (Zod)
4. Gửi email đến admin (Resend API):
   - Subject: `[FGS Software] New inquiry from {Tên} — {Công ty}`
   - Nội dung HTML đẹp, có đủ thông tin
5. Gửi email xác nhận đến người gửi (auto-reply)
6. Lưu vào database bảng `messages`
7. Hiển thị thông báo thành công / lỗi

**Bên cạnh form:**
- Thông tin liên hệ: email, địa chỉ, giờ làm việc
- Map nhúng Google Maps (tùy chọn)
- Mạng xã hội

---

### 4.7 Blog — `/blog` *(giai đoạn 2)*

- Danh sách bài viết (card: thumbnail, tiêu đề, tóm tắt, ngày, tag)
- Trang chi tiết `/blog/[slug]` với Markdown/MDX content
- Filter theo tag/category
- SEO tối ưu (meta, og:image)

---

## 5. Admin Panel (Protected)

### 5.1 Authentication

```typescript
// Yêu cầu
- Đăng nhập bằng email + password
- JWT session (7 ngày)
- Tất cả route /admin/* đều protected bằng middleware
- Logout button
- Chỉ 1 tài khoản admin ban đầu (seed từ .env)
```

### 5.2 Quản lý Team — `/admin/team`

```
Danh sách:
- Bảng hiển thị tất cả thành viên
- Cột: Avatar | Tên | Role | Kinh nghiệm | Trạng thái | Actions
- Nút: + Thêm thành viên
- Tìm kiếm theo tên

Form Thêm/Sửa (modal hoặc trang riêng):
- Upload avatar (lưu local /public/uploads hoặc Cloudinary)
- Họ tên (*)
- Chức danh / Role (*)
- Số năm kinh nghiệm
- Kỹ năng (tag input — thêm nhiều kỹ năng)
- Mô tả ngắn (textarea)
- LinkedIn URL
- GitHub URL
- Thứ tự hiển thị (số)
- Trạng thái: Hiển thị / Ẩn

Xóa:
- Confirm dialog trước khi xóa
```

### 5.3 Quản lý Dịch vụ — `/admin/services`

```
- CRUD tương tự team
- Fields: Icon (chọn từ thư viện Lucide), Tên, Mô tả, Danh sách tech, Thứ tự, Trạng thái
```

### 5.4 Quản lý Portfolio — `/admin/works`

```
- CRUD dự án
- Fields: Thumbnail upload, Tên, Slug (tự gen), Mô tả ngắn, Mô tả chi tiết (rich text),
  Tech stack (tag), Loại dự án, Thời gian, Gallery ảnh, Link demo, Link GitHub,
  Thứ tự, Trạng thái
```

### 5.5 Quản lý Blog — `/admin/blog`

```
- CRUD bài viết
- Fields: Thumbnail, Tiêu đề, Slug, Nội dung (Markdown editor — react-md-editor),
  Tóm tắt, Tags, Ngày đăng, Trạng thái (Draft / Published)
```

### 5.6 Xem Messages — `/admin/messages`

```
- Danh sách tin nhắn từ form liên hệ
- Cột: Ngày | Tên | Email | Công ty | Loại dự án | Trạng thái | Actions
- Click xem chi tiết (modal)
- Đánh dấu: Chưa đọc / Đã đọc / Đã xử lý
- Không xóa (lưu trữ lịch sử)
```

### 5.7 Cài đặt — `/admin/settings`

```
- Tên công ty
- Email nhận liên hệ (admin email)
- Email phụ CC (tùy chọn)
- Địa chỉ công ty
- Số điện thoại
- Facebook, LinkedIn, GitHub URL
- Google Analytics ID
- Meta title & description mặc định
```

---

## 6. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  createdAt DateTime @default(now())
}

model TeamMember {
  id         String   @id @default(cuid())
  name       String
  role       String
  bio        String?
  avatar     String?  // URL
  experience Int?     // years
  skills     String[] // array of skill tags
  linkedin   String?
  github     String?
  order      Int      @default(0)
  isVisible  Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Service {
  id          String   @id @default(cuid())
  icon        String   // Lucide icon name
  title       String
  description String
  techStack   String[]
  order       Int      @default(0)
  isVisible   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Work {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  summary     String
  description String   // Markdown
  thumbnail   String?
  gallery     String[]
  techStack   String[]
  category    String   // web | mobile | api | other
  duration    String?
  demoUrl     String?
  githubUrl   String?
  order       Int      @default(0)
  isVisible   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BlogPost {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  summary     String
  content     String   // Markdown
  thumbnail   String?
  tags        String[]
  status      String   @default("draft") // draft | published
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Message {
  id          String   @id @default(cuid())
  name        String
  email       String
  company     String?
  phone       String?
  projectType String?
  budget      String?
  message     String
  status      String   @default("unread") // unread | read | done
  createdAt   DateTime @default(now())
}

model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value String
}
```

---

## 7. API Routes

```typescript
// Public APIs
POST   /api/contact              // Gửi form liên hệ → email + lưu DB

// Admin APIs (tất cả yêu cầu Bearer token)
// Auth
POST   /api/auth/login
POST   /api/auth/logout

// Team
GET    /api/admin/team
POST   /api/admin/team
PUT    /api/admin/team/[id]
DELETE /api/admin/team/[id]
POST   /api/admin/team/upload    // Upload avatar

// Services
GET    /api/admin/services
POST   /api/admin/services
PUT    /api/admin/services/[id]
DELETE /api/admin/services/[id]

// Works
GET    /api/admin/works
POST   /api/admin/works
PUT    /api/admin/works/[id]
DELETE /api/admin/works/[id]

// Blog
GET    /api/admin/blog
POST   /api/admin/blog
PUT    /api/admin/blog/[id]
DELETE /api/admin/blog/[id]

// Messages
GET    /api/admin/messages
PUT    /api/admin/messages/[id]  // Update status

// Settings
GET    /api/admin/settings
PUT    /api/admin/settings
```

---

## 8. Tính năng bổ sung quan trọng

### 8.1 Đa ngôn ngữ (i18n) — 3 ngôn ngữ

**Package:** `next-intl`

**Các ngôn ngữ hỗ trợ:**

| Mã | Ngôn ngữ | Vai trò | Font bổ sung |
|----|----------|---------|--------------|
| `en` | English | Mặc định / chính | Inter |
| `ja` | 日本語 (Tiếng Nhật) | Thị trường mục tiêu | Noto Sans JP |
| `vi` | Tiếng Việt | Nội bộ / nhà tuyển dụng | Noto Sans Vietnamese (Inter đã cover) |

**Cấu trúc URL:**
```
/en/...   → English
/ja/...   → 日本語
/vi/...   → Tiếng Việt
/         → tự động redirect theo Accept-Language header của trình duyệt
            fallback: /en/
```

**Cấu trúc file dịch:**
```
messages/
├── en.json     # English (bản gốc)
├── ja.json     # 日本語
└── vi.json     # Tiếng Việt
```

**Ví dụ file `messages/en.json`:**
```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "services": "Services",
    "team": "Team",
    "works": "Our Works",
    "blog": "Blog",
    "contact": "Contact Us"
  },
  "hero": {
    "headline": "Your Trusted IT Outsourcing Partner in Vietnam",
    "subheadline": "We build high-quality software for Japanese businesses",
    "cta_contact": "Get in Touch",
    "cta_works": "View Our Work"
  },
  "contact": {
    "title": "Contact Us",
    "name": "Full Name",
    "email": "Email Address",
    "company": "Company Name",
    "phone": "Phone Number",
    "project_type": "Project Type",
    "budget": "Estimated Budget",
    "message": "Project Description",
    "submit": "Send Message",
    "success": "Your message has been sent successfully!",
    "error": "Something went wrong. Please try again."
  }
}
```

**Ví dụ file `messages/ja.json`:**
```json
{
  "nav": {
    "home": "ホーム",
    "about": "会社概要",
    "services": "サービス",
    "team": "チーム",
    "works": "制作実績",
    "blog": "ブログ",
    "contact": "お問い合わせ"
  },
  "hero": {
    "headline": "ベトナムの信頼できるITアウトソーシングパートナー",
    "subheadline": "日本企業向けに高品質なソフトウェアを開発します",
    "cta_contact": "お問い合わせ",
    "cta_works": "実績を見る"
  }
}
```

**Ví dụ file `messages/vi.json`:**
```json
{
  "nav": {
    "home": "Trang chủ",
    "about": "Giới thiệu",
    "services": "Dịch vụ",
    "team": "Đội ngũ",
    "works": "Dự án",
    "blog": "Blog",
    "contact": "Liên hệ"
  },
  "hero": {
    "headline": "Đối tác Outsourcing IT đáng tin cậy tại Việt Nam",
    "subheadline": "Chúng tôi phát triển phần mềm chất lượng cao cho doanh nghiệp Nhật Bản",
    "cta_contact": "Liên hệ ngay",
    "cta_works": "Xem dự án"
  }
}
```

**Language Switcher component (Header):**
```tsx
// Hiển thị 3 nút chọn ngôn ngữ
<LanguageSwitcher />
// → EN | 日本語 | VI
// Active locale được highlight
// Khi chuyển ngôn ngữ: giữ nguyên path hiện tại, chỉ đổi locale prefix
```

**next-intl config:**
```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();
export default withNextIntl({ ... });

// i18n.ts
export const locales = ['en', 'ja', 'vi'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';
```

**Middleware (tự động redirect theo ngôn ngữ trình duyệt):**
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
export default createMiddleware({
  locales: ['en', 'ja', 'vi'],
  defaultLocale: 'en',
  localeDetection: true, // detect từ Accept-Language header
});
```

**Nội dung động trong Database:**
Các model có nội dung hiển thị ra người dùng cần thêm field đa ngôn ngữ:

```prisma
model TeamMember {
  // ... các field khác
  bio     String?   // English (mặc định)
  bioJa   String?   // 日本語
  bioVi   String?   // Tiếng Việt
  role    String
  roleJa  String?
  roleVi  String?
}

model Service {
  title         String
  titleJa       String?
  titleVi       String?
  description   String
  descriptionJa String?
  descriptionVi String?
}

model Work {
  title         String
  titleJa       String?
  titleVi       String?
  summary       String
  summaryJa     String?
  summaryVi     String?
  description   String    // Markdown EN
  descriptionJa String?   // Markdown JA
  descriptionVi String?   // Markdown VI
}

model BlogPost {
  title         String
  titleJa       String?
  titleVi       String?
  summary       String
  summaryJa     String?
  summaryVi     String?
  content       String    // Markdown EN
  contentJa     String?   // Markdown JA
  contentVi     String?   // Markdown VI
}
```

**Helper function để lấy nội dung theo locale:**
```typescript
// lib/i18n-content.ts
export function getLocalizedField<T extends Record<string, any>>(
  obj: T,
  field: string,
  locale: Locale
): string {
  if (locale === 'ja' && obj[`${field}Ja`]) return obj[`${field}Ja`];
  if (locale === 'vi' && obj[`${field}Vi`]) return obj[`${field}Vi`];
  return obj[field] ?? ''; // fallback về English
}

// Ví dụ dùng:
const title = getLocalizedField(service, 'title', locale);
// → locale='ja' → service.titleJa ?? service.title
// → locale='vi' → service.titleVi ?? service.title
// → locale='en' → service.title
```

**Admin Panel — Quản lý đa ngôn ngữ:**
```
Trong form thêm/sửa Team / Services / Works / Blog:
- Hiển thị dạng Tab: [English] [日本語] [Tiếng Việt]
- Mỗi tab có textarea riêng cho nội dung ngôn ngữ đó
- Field tiếng Anh bắt buộc (*)
- Field tiếng Nhật và Việt tùy chọn (nếu để trống → fallback về EN)
- Hiển thị badge "Missing JA" / "Missing VI" nếu chưa dịch
```

**SEO đa ngôn ngữ:**
```typescript
// Mỗi trang cần có hreflang tags
<link rel="alternate" hreflang="en" href="https://fgs-software.com/en/..." />
<link rel="alternate" hreflang="ja" href="https://fgs-software.com/ja/..." />
<link rel="alternate" hreflang="vi" href="https://fgs-software.com/vi/..." />
<link rel="alternate" hreflang="x-default" href="https://fgs-software.com/en/..." />

// Sitemap bao gồm tất cả locale variants
// /sitemap.xml tự động gen bởi Next.js app/sitemap.ts
```

### 8.2 SEO
```
- next/metadata cho mỗi trang
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card
- Sitemap tự động (/sitemap.xml)
- Robots.txt
- Structured data (JSON-LD) cho trang công ty
- Canonical URLs
```

### 8.3 Performance
```
- next/image cho tất cả hình ảnh (lazy load, WebP, responsive)
- Font tối ưu: next/font (Google Fonts — Inter + Noto Sans JP)
- Code splitting tự động (Next.js)
- Lighthouse score mục tiêu: 90+ tất cả mục
```

### 8.4 Analytics & Tracking
```
- Google Analytics 4 (gtag.js qua next/script)
- Google Search Console (sitemap submit)
```

### 8.5 Security
```
- Rate limiting cho /api/contact (max 5 request/IP/giờ — upstash/ratelimit)
- CSRF protection (SameSite cookie)
- Input sanitization (DOMPurify cho rich text)
- Helmet headers (next.config.ts headers)
- Admin password: bcrypt hash, min 12 ký tự
- .env không commit lên Git (.gitignore)
```

### 8.6 Responsive Design
```
- Mobile-first approach
- Breakpoints: sm (640px) / md (768px) / lg (1024px) / xl (1280px)
- Navigation: Hamburger menu trên mobile
- Tất cả grid/layout thích ứng theo màn hình
```

---

## 9. Hosting & Deployment

### 9.1 Kiến trúc deploy

```
┌─────────────────────────────────────────┐
│  Vercel (Frontend + API Routes)         │
│  → Auto deploy từ GitHub main branch    │
│  → Custom domain: fgs-software.com      │
│  → Free tier: đủ dùng giai đoạn đầu    │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│  Supabase (PostgreSQL Database)         │
│  → Free tier: 500MB, 2 projects         │
│  → Connection pooling (PgBouncer)       │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│  Cloudinary (Image Storage) — tùy chọn │
│  → Upload avatar, thumbnail, gallery   │
│  → Free tier: 25GB                     │
│  → Hoặc dùng Vercel Blob Storage        │
└─────────────────────────────────────────┘
```

### 9.2 Môi trường

```bash
# .env.local (không commit lên Git)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="random-secret-32-chars"
NEXTAUTH_URL="https://fgs-software.com"

RESEND_API_KEY="re_..."
ADMIN_EMAIL="contact@fgs-software.com"

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
ADMIN_DEFAULT_EMAIL="admin@fgs-software.com"
ADMIN_DEFAULT_PASSWORD="..."  # bcrypt hash
```

### 9.3 CI/CD

```yaml
# Tự động qua Vercel GitHub Integration
- Push lên main → deploy Production
- Push lên develop → deploy Preview URL
- Chạy type-check + lint trước khi deploy
```

---

## 10. Packages cần cài đặt

```bash
# Core
npx create-next-app@latest fgs-software --typescript --tailwind --app

# UI Components
npx shadcn@latest init
npx shadcn@latest add button card input textarea select badge dialog table

# Form & Validation
npm install react-hook-form zod @hookform/resolvers

# Auth
npm install next-auth bcryptjs
npm install -D @types/bcryptjs

# Database
npm install @prisma/client prisma
npx prisma init

# Email
npm install resend

# i18n — 3 ngôn ngữ (EN / JA / VI)
npm install next-intl

# Rich Text / Markdown
npm install react-md-editor @uiw/react-md-editor

# Image Upload
npm install cloudinary next-cloudinary

# Rate Limiting
npm install @upstash/ratelimit @upstash/redis

# Animation
npm install framer-motion

# Icons
npm install lucide-react

# Utils
npm install clsx tailwind-merge date-fns slugify
```

---

## 11. Thứ tự triển khai (cho Copilot)

```
Bước 1: Setup project
  - create-next-app với TypeScript + Tailwind
  - Cài packages
  - Cấu hình prisma schema
  - Setup .env.local

Bước 2: Database & Auth
  - Prisma migrate
  - Seed admin account
  - NextAuth setup
  - Middleware bảo vệ /admin routes

Bước 3: Layout & Design System
  - Header (nav + language switcher)
  - Footer
  - Color tokens, fonts (Inter + Noto Sans JP cho tiếng Nhật, Inter đã cover tiếng Việt)
  - Responsive navigation

Bước 4: Public Pages
  - Trang chủ (tất cả sections)
  - About
  - Services
  - Team (hiển thị từ DB)
  - Works (hiển thị từ DB)
  - Contact (form + API route + email)

Bước 5: Admin Panel
  - Login page
  - Dashboard layout (sidebar)
  - CRUD Team
  - CRUD Services
  - CRUD Works
  - View Messages
  - Settings

Bước 6: i18n (3 ngôn ngữ)
  - Setup next-intl + middleware locale detection
  - Tạo messages/en.json, messages/ja.json, messages/vi.json
  - Cập nhật Prisma schema thêm field *Ja, *Vi cho các model
  - Language switcher component (EN | 日本語 | VI)
  - Admin form: Tab 3 ngôn ngữ cho nội dung động
  - hreflang tags + sitemap đa ngôn ngữ

Bước 7: SEO & Performance
  - Metadata mỗi trang
  - Sitemap, robots.txt
  - next/image optimization
  - Analytics

Bước 8: Deploy
  - Kết nối Vercel + GitHub
  - Setup Supabase production DB
  - Cấu hình env vars trên Vercel
  - Custom domain
```

---

## 12. Ghi chú cho Copilot

- Tất cả component viết bằng **TypeScript** với type đầy đủ, không dùng `any`
- Dùng **App Router** (không dùng Pages Router)
- Tất cả Server Actions / API routes phải **validate input bằng Zod**
- Admin APIs phải kiểm tra session trước khi xử lý
- Dùng **`next/image`** cho tất cả `<img>` tag
- Dùng **`next/link`** cho tất cả internal link
- Error handling đầy đủ: try/catch cho mọi async operation
- Form phải có loading state khi submit
- Toast notification (shadcn Sonner) cho thành công/lỗi
- Tất cả text public-facing phải có bản **EN + JA + VI** trong file messages/
- Nội dung động trong DB: field EN bắt buộc, JA và VI fallback về EN nếu trống
- Dùng helper `getLocalizedField()` để lấy nội dung theo locale — không hardcode điều kiện ngôn ngữ rải rác trong component
- Comment code bằng tiếng Anh
- Không hardcode màu sắc — dùng Tailwind CSS variables / design tokens

---

*Tài liệu này đủ để GitHub Copilot hoặc AI coding assistant triển khai toàn bộ dự án từ đầu.*
