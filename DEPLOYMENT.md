# راهنمای نصب و راه‌اندازی Docker و پروژه BnpWebApp

این مستند مراحل کامل نصب Docker، کلون کردن پروژه از GitHub، تنظیم Environment Variables و اجرای پروژه با Docker Compose را روی سرور لینوکسی (Ubuntu) توضیح می‌دهد.

---

## 1. نصب Docker (داکر)

### 1.1 به‌روزرسانی لیست بسته‌ها

```bash
sudo apt update
```

### 1.2 نصب پیش‌نیازها

این بسته‌ها به APT اجازه می‌دهند از مخازن HTTPS استفاده کند:

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

### 1.3 افزودن کلید GPG رسمی Docker

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

### 1.4 افزودن ریپازیتوری Docker

(برای Ubuntu 20.04 - focal)

```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
```

برای Ubuntu 22.04 (jammy):

```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu jammy stable"
```

### 1.5 بررسی منبع نصب Docker

```bash
apt-cache policy docker-ce
```

خروجی باید نشان دهد که بسته از مخزن رسمی Docker قابل نصب است.

### 1.6 نصب Docker

```bash
sudo apt install docker-ce
```

### 1.7 بررسی وضعیت سرویس Docker

```bash
sudo systemctl status docker
```

وضعیت باید `active (running)` باشد.

### 1.8 نصب Docker Compose

```bash
sudo apt install docker-compose-plugin
```

بررسی نصب:

```bash
docker compose version
```

---

## 2. اجرای Docker بدون sudo (اختیاری)

برای اجرای دستورات Docker بدون استفاده از `sudo`:

```bash
sudo usermod -aG docker ${USER}
```

سپس یکی از دستورات زیر را اجرا کنید:

```bash
su - ${USER}
```

یا از سرور logout و دوباره login کنید.

بررسی عضویت در گروه docker:

```bash
groups
```

---

## 3. راه‌اندازی پروژه روی سرور لینوکس

### 3.1 کلون کردن پروژه از GitHub

**نکته مهم:** به دلیل محدودیت‌های GitHub باید از Personal Access Token (PAT) استفاده شود.

#### ساخت Token در GitHub

1. GitHub → Settings
2. Developer settings
3. Personal access tokens → Tokens (classic)
4. Generate new token
5. انتخاب scope: `repo` (دسترسی کامل به repository)

#### کلون با استفاده از Token

```bash
git clone https://<TOKEN>@github.com/<USERNAME>/<REPO-NAME>.git
```

یا اگر repository private است:

```bash
git clone https://<USERNAME>:<TOKEN>@github.com/<USERNAME>/<REPO-NAME>.git
```

سپس وارد پوشه پروژه شوید:

```bash
cd BnpWebApp
```

---

## 4. تنظیم Environment Variables

### 4.1 ایجاد فایل Environment Variables

این پروژه Vue.js از متغیرهای محیطی برای تنظیم API Base URL استفاده می‌کند.

اگر نیاز به تنظیم `VITE_API_BASE_URL` دارید، می‌توانید:

**گزینه 1:** استفاده از build-time environment variables

```bash
# در زمان build
VITE_API_BASE_URL=https://api.example.com npm run build
```

**گزینه 2:** استفاده از nginx برای proxy کردن API requests

اگر backend API شما در همان سرور یا شبکه داخلی است، می‌توانید nginx را برای proxy کردن تنظیم کنید (فایل `nginx.conf` را ویرایش کنید).

### 4.2 تنظیم nginx برای API Proxy (اختیاری)

اگر backend API شما در آدرس دیگری است، فایل `nginx.conf` را ویرایش کنید:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Proxy API requests to backend
    location /api {
        proxy_pass http://backend-server:5117;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Handle client-side routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ... سایر تنظیمات
}
```

---

## 5. ساخت و اجرای Containerها

### 5.1 اجرای پروژه در محیط Production

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 5.2 اجرای پروژه در محیط Development

```bash
docker compose up -d --build
```

### 5.3 مشاهده لاگ‌ها

```bash
docker compose logs -f web
```

### 5.4 توقف Containerها

```bash
docker compose down
```

### 5.5 توقف و حذف Volumeها

```bash
docker compose down -v
```

---

## 6. رفع خطاهای رایج اتصال و اینترنت

### 6.1 تغییر DNS سرور

در صورت بروز خطاهایی مانند `TLS handshake timeout`:

```bash
sudo nano /etc/resolv.conf
```

مقادیر زیر را اضافه کنید:

```
nameserver 8.8.8.8
nameserver 1.1.1.1
```

سپس Docker را ری‌استارت کنید:

```bash
sudo systemctl restart docker
```

### 6.2 غیرفعال کردن IPv6

```bash
sudo nano /etc/sysctl.conf
```

اضافه کردن خطوط زیر:

```
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
```

اعمال تنظیمات و ری‌استارت Docker:

```bash
sudo sysctl -p
sudo systemctl restart docker
```

### 6.3 تنظیم DNS برای Docker Daemon

```bash
sudo nano /etc/docker/daemon.json
```

محتوای فایل:

```json
{
  "dns": ["8.8.8.8", "1.1.1.1"]
}
```

ری‌استارت Docker:

```bash
sudo systemctl restart docker
```

---

## 7. اجرای مجدد Containerها

پس از اعمال تنظیمات شبکه:

```bash
docker compose up -d --build
```

---

## 8. دستورات مفید Docker

### 8.1 مشاهده Containerهای در حال اجرا

```bash
docker ps
```

### 8.2 مشاهده تمام Containerها (شامل متوقف شده)

```bash
docker ps -a
```

### 8.3 مشاهده لاگ‌های Container

```bash
docker logs bnp-webapp-prod
```

### 8.4 ورود به داخل Container

```bash
docker exec -it bnp-webapp-prod sh
```

### 8.5 توقف Container

```bash
docker stop bnp-webapp-prod
```

### 8.6 راه‌اندازی مجدد Container

```bash
docker restart bnp-webapp-prod
```

### 8.7 حذف Container

```bash
docker rm bnp-webapp-prod
```

### 8.8 مشاهده استفاده از منابع

```bash
docker stats
```

---

## 9. به‌روزرسانی پروژه

### 9.1 دریافت آخرین تغییرات از GitHub

```bash
git pull origin main
```

### 9.2 ساخت مجدد و راه‌اندازی

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 9.3 پاک کردن Imageهای قدیمی (اختیاری)

```bash
docker image prune -a
```

---

## 10. تنظیم Firewall (اگر نیاز باشد)

### 10.1 باز کردن پورت 80

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # اگر از HTTPS استفاده می‌کنید
```

### 10.2 فعال کردن Firewall

```bash
sudo ufw enable
```

### 10.3 بررسی وضعیت Firewall

```bash
sudo ufw status
```

---

## 11. استفاده از Nginx Reverse Proxy (پیشرفته)

اگر می‌خواهید از domain name استفاده کنید و SSL certificate اضافه کنید:

### 11.1 نصب Nginx روی سرور

```bash
sudo apt install nginx
```

### 11.2 تنظیم Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/bnp-webapp
```

محتوای فایل:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 11.3 فعال کردن Configuration

```bash
sudo ln -s /etc/nginx/sites-available/bnp-webapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 12. جمع‌بندی

با انجام مراحل بالا:

- ✅ Docker به‌صورت استاندارد نصب شده است
- ✅ پروژه با GitHub Token کلون شده است
- ✅ Containerها در محیط Development یا Production اجرا می‌شوند
- ✅ مشکلات رایج DNS و TLS برطرف می‌شوند
- ✅ اپلیکیشن در آدرس `http://your-server-ip` یا `http://your-domain.com` در دسترس است

---

## 13. عیب‌یابی

### مشکل: Container اجرا نمی‌شود

```bash
# بررسی لاگ‌ها
docker compose logs web

# بررسی وضعیت Container
docker ps -a
```

### مشکل: پورت در حال استفاده است

```bash
# بررسی پورت‌های در حال استفاده
sudo netstat -tulpn | grep :80

# یا
sudo lsof -i :80
```

### مشکل: خطای Build

```bash
# پاک کردن cache و build مجدد
docker compose build --no-cache
```

---

این مستند می‌تواند به‌عنوان راهنمای رسمی راه‌اندازی پروژه مورد استفاده قرار گیرد.
