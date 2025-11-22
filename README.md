# Backend - Express + Mongoose + Cloudinary

متطلبات:
- Node.js 16+
- MongoDB URI
- حساب Cloudinary

إعداد:
1. انسخ `.env.example` إلى `.env` وملء المتغيرات.
2. npm install
3. npm run dev

نقاط مهمة:
- مصادقة JWT. ضع الـ token في Authorization header: `Bearer <token>`
- رفع الملفات يستخدم Cloudinary

لإنشاء أرشيف zip للمشروع (بعد استبعاد node_modules إذا أردت):
Unix-like:
```
zip -r backend.zip . -x "node_modules/*"
```

Windows (PowerShell):
```
Compress-Archive -Path * -DestinationPath backend.zip -Force
```
