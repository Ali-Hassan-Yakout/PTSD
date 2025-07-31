# دليل النشر والتشغيل - منصة دعم PTSD

## نظرة عامة

هذا الدليل يوضح كيفية نشر وتشغيل منصة دعم PTSD المحدثة مع جميع الميزات الجديدة.

## المتطلبات الأساسية

### 1. متطلبات الخادم
- خادم ويب يدعم HTTPS (مطلوب لـ Firebase)
- Node.js 14+ (اختياري للاختبار المحلي)
- مساحة تخزين: 50MB على الأقل

### 2. متطلبات Firebase
- حساب Firebase نشط
- مشروع Firebase مع Firestore Database
- Authentication مفعل
- Storage مفعل (اختياري للملفات)

## خطوات النشر

### الخطوة 1: إعداد Firebase

1. **إنشاء مشروع Firebase جديد**
   ```bash
   # انتقل إلى https://console.firebase.google.com
   # أنشئ مشروع جديد باسم "ptsd-support-app"
   ```

2. **تفعيل الخدمات المطلوبة**
   - Authentication (Email/Password)
   - Firestore Database
   - Storage (اختياري)

3. **إعداد قواعد الأمان لـ Firestore**
   ```javascript
   // قواعد الأمان الموصى بها
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // المستخدمين
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null && 
           (resource.data.role == 'admin' || request.auth.uid == userId);
       }
       
       // الاستبيانات
       match /questionnaires/{docId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
       }
       
       // التوصيات
       match /recommendations/{docId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
       }
       
       // التقارير
       match /reports/{docId} {
         allow read, write: if request.auth != null && 
           (resource.data.userId == request.auth.uid || 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor');
       }
     }
   }
   ```

### الخطوة 2: تكوين التطبيق

1. **تحديث firebase-config.js**
   ```javascript
   // استبدل بإعدادات مشروعك
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

2. **إنشاء أول حساب إدارة**
   - انتقل إلى `create-admin.html`
   - استخدم الرمز: `ADMIN2024`
   - أنشئ حساب الإدارة الأول

### الخطوة 3: نشر الملفات

#### الخيار أ: النشر على خادم ويب تقليدي

1. **رفع الملفات**
   ```bash
   # انسخ جميع الملفات إلى مجلد الخادم
   cp -r * /var/www/html/ptsd-app/
   ```

2. **إعداد HTTPS**
   ```bash
   # مثال لـ Apache
   <VirtualHost *:443>
       ServerName your-domain.com
       DocumentRoot /var/www/html/ptsd-app
       SSLEngine on
       SSLCertificateFile /path/to/cert.pem
       SSLCertificateKeyFile /path/to/key.pem
   </VirtualHost>
   ```

#### الخيار ب: النشر على Firebase Hosting

1. **تثبيت Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **تهيئة المشروع**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **نشر التطبيق**
   ```bash
   firebase deploy --only hosting
   ```

#### الخيار ج: النشر على GitHub Pages

1. **إنشاء مستودع GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/ptsd-app.git
   git push -u origin main
   ```

2. **تفعيل GitHub Pages**
   - انتقل إلى Settings > Pages
   - اختر Source: Deploy from a branch
   - اختر Branch: main

## اختبار التطبيق

### 1. اختبار الوظائف الأساسية
- [ ] تسجيل حساب جديد (مريض)
- [ ] تسجيل حساب طبيب
- [ ] تسجيل الدخول
- [ ] نسيان كلمة المرور
- [ ] ملء الاستبيان
- [ ] عرض التوصيات

### 2. اختبار لوحة الإدارة
- [ ] تسجيل دخول الإدارة
- [ ] عرض طلبات الأطباء
- [ ] الموافقة/الرفض على الطلبات
- [ ] عرض الإحصائيات

### 3. اختبار لوحة الطبيب
- [ ] تسجيل دخول الطبيب
- [ ] عرض المرضى
- [ ] إضافة التقارير
- [ ] الدردشة مع المرضى

## إعدادات الأمان

### 1. حماية Firebase
```javascript
// إعدادات Authentication
- تفعيل Email/Password
- تعيين سياسات كلمات المرور القوية
- تفعيل التحقق من البريد الإلكتروني (اختياري)
```

### 2. حماية الخادم
```bash
# إعدادات Apache الأمان
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

### 3. مراقبة الأخطاء
```javascript
// إضافة مراقبة الأخطاء
window.addEventListener('error', function(e) {
  console.error('Application error:', e.error);
  // إرسال إلى خدمة مراقبة الأخطاء
});
```

## الصيانة والدعم

### 1. النسخ الاحتياطي
```bash
# نسخ احتياطي دوري لقاعدة البيانات
firebase firestore:export ./backup-$(date +%Y%m%d)
```

### 2. مراقبة الأداء
- مراقبة استخدام Firebase
- مراقبة سرعة التطبيق
- مراقبة الأخطاء

### 3. التحديثات
```bash
# تحديث التطبيق
git pull origin main
# اختبار التحديثات
# نشر التحديثات
firebase deploy
```

## استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في Firebase**
   ```
   الحل: تأكد من صحة إعدادات Firebase
   ```

2. **مشاكل في HTTPS**
   ```
   الحل: تأكد من صحة شهادات SSL
   ```

3. **مشاكل في التحميل**
   ```
   الحل: تحقق من حجم الملفات وضغط الصور
   ```

### سجلات الأخطاء
```bash
# عرض سجلات Firebase
firebase functions:log

# عرض سجلات الخادم
tail -f /var/log/apache2/error.log
```

## الأداء والتحسين

### 1. تحسين التحميل
- ضغط الصور
- استخدام CDN
- تحسين CSS/JS

### 2. تحسين قاعدة البيانات
- إنشاء فهارس مناسبة
- تنظيف البيانات القديمة
- مراقبة الاستعلامات

### 3. تحسين الأمان
- تحديث المكتبات بانتظام
- مراجعة قواعد الأمان
- اختبار الاختراق

## الدعم الفني

### معلومات الاتصال
- البريد الإلكتروني: support@ptsd-app.com
- الهاتف: +249-XXX-XXXX
- ساعات العمل: الأحد - الخميس 9:00 - 17:00

### الوثائق الإضافية
- [دليل المستخدم](USER_GUIDE.md)
- [دليل المطور](DEVELOPER_GUIDE.md)
- [API Documentation](API_DOCS.md)

---

**آخر تحديث:** ديسمبر 2024
**الإصدار:** 2.0.0