SmartFarm Admin (TKC)
=====================
⚙️ Installation
----------------
1. ติดตั้ง Bun (ถ้ายังไม่มี)
   curl -fsSL https://bun.sh/install | bash

2. Clone โปรเจกต์และติดตั้ง dependencies
   git clone https://github.com/<your-username>/SmartFarm-Admin-TKC.git
   cd SmartFarm-Admin-TKC
   bun install


🧠 Environment Variables
-------------------------
สร้างไฟล์ .env.local ที่ root ของโปรเจกต์ เช่น

VITE_API_BASE_URL=https://api.smartfarm-tkc.com
VITE_MAP_API_KEY=YOUR_MAP_KEY_HERE
VITE_APP_ENV=development


💻 Development
---------------
เริ่มรันระบบแอดมินในโหมดพัฒนา:

bun run dev

เมื่อรันสำเร็จ จะได้ URL ดังนี้:
- Local:   http://localhost:3000/admin/
- Network: http://192.168.1.33:3000/admin/


🏗️ Build for Production
------------------------
bun run build
bun run preview

หรือใช้บน Production Server โดย deploy ไฟล์ที่อยู่ในโฟลเดอร์ `dist/`


🧪 Scripts
-----------
คำสั่ง         | คำอธิบาย
----------------|----------------------------------
bun run dev     | รันเซิร์ฟเวอร์โหมดพัฒนา
bun run build   | สร้างไฟล์สำหรับ production
bun run preview | ทดสอบ production build ในเครื่อง
bun run lint    | ตรวจสอบ code style และ lint error


📦 Deployment
--------------
สามารถ deploy ได้หลายรูปแบบ เช่น:

✅ Static Hosting
- นำโฟลเดอร์ `dist` ไปวางใน Nginx / Apache / หรือ Vercel

✅ Docker
ตัวอย่าง Dockerfile:

FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "preview"]