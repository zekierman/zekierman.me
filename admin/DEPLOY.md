# Sunucu kurulumu

Ubuntu 24.04 LTS · 4 GB RAM · 3 CPU · 40 GB SSD

Bu dosya sunucuyu sıfırdan ayağa kaldırır. **Komutları sen çalıştıracaksın** — parolan
ve anahtarların hiçbir yere kopyalanmasın. Her adımın altında neden öyle yapıldığı yazıyor;
sunucu bir gün sıfırlanırsa bu dosya yeniden kurmaya yeter.

Aşağıda `zekierman.me` alan adı ve `zeki` kullanıcı adı varsayılmıştır.

---

## 0 — Kendi bilgisayarında: SSH anahtarı

Sunucuya parolayla değil anahtarla gireceksin. Parola ile giriş kaba kuvvet denemelerine
açıktır ve bir VPS'in IP'si alındığı gün taranmaya başlar.

```bash
ssh-keygen -t ed25519 -C "zekierman.me"      # parola sorarsa boş geçme, bir parola koy
cat ~/.ssh/id_ed25519.pub                     # bu satırı kopyala, birazdan lazım
```

Sağlayıcı sana root parolası verdiyse ilk girişte kullan, sonra kapatacağız.

---

## 1 — İlk giriş, kullanıcı, güncelleme

```bash
ssh root@SUNUCU_IP

apt update && apt -y upgrade
adduser zeki                                  # kendi parolanı belirle
usermod -aG sudo zeki

mkdir -p /home/zeki/.ssh
nano /home/zeki/.ssh/authorized_keys          # 0. adımdaki public anahtarı yapıştır
chown -R zeki:zeki /home/zeki/.ssh
chmod 700 /home/zeki/.ssh
chmod 600 /home/zeki/.ssh/authorized_keys
```

**Çıkmadan önce yeni kullanıcıyla girebildiğini doğrula.** Başka bir terminal aç:

```bash
ssh zeki@SUNUCU_IP
```

Girebiliyorsan root oturumuna dön ve parolayla girişi kapat:

```bash
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
```

> Doğrulamadan bu adımı yaparsan kendini sunucudan kilitlersin. Sırayı atlama.

---

## 2 — Güvenlik duvarı

Sadece üç kapı açık kalsın. Panel kendi portundan (4322) **dışarıya açılmayacak**;
ona nginx üzerinden gidilecek.

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

---

## 3 — Swap

Derleme tepe noktasında ~700 MB istiyor. 4 GB'da sığar, ama panelden proje eklerken
derleme belleğe takılırsa site bir süre yayından kalkar. Swap o riski kapatır.

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h
```

---

## 4 — Gerekli paketler

```bash
apt -y install git nginx ffmpeg curl ca-certificates
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt -y install nodejs
node -v && ffmpeg -version | head -1
```

Node 22 LTS yeterli. ffmpeg panelin görsel işlemesi için şart — onsuz yükleme çalışmaz.

---

## 5 — Depoyu çek

```bash
sudo -iu zeki
git clone https://github.com/zekierman/zekierman.me.git ~/site
cd ~/site
npm ci
npm run build          # dist/ oluşmalı
```

`npm ci` birkaç dakika sürer ve ~220 MB yer kaplar, normal.

**Panelin git'e push atmasını istiyorsan** (içeriğin sunucu dışında da yedeklenmesi için)
sunucuda bir deploy anahtarı üret ve GitHub'a ekle:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/deploy -N ""
cat ~/.ssh/deploy.pub
# GitHub → repo → Settings → Deploy keys → Add → "Allow write access" işaretle
printf 'Host github.com\n  IdentityFile ~/.ssh/deploy\n' >> ~/.ssh/config
git remote set-url origin git@github.com:zekierman/zekierman.me.git
git config user.name "zekierman.me panel"
git config user.email "panel@zekierman.me"
ssh -T git@github.com        # doğrulama
```

Bunu atlarsan panel yine çalışır, sadece commit'ler sunucuda kalır.

---

## 6 — Panel

```bash
cd ~/site/admin
npm ci
npm run set-password        # parolayı sen belirle, ekrana yazılmaz
```

En az 12 karakter kullan. Bu panelin tek kilidi. Parola hiçbir yere yazılmaz; diske
sadece scrypt hash'i ve tuzu gider (`admin/.credentials.json`, git'e girmez).

---

## 7 — Servis

```bash
exit          # zeki kullanıcısından root'a dön
cat >/etc/systemd/system/zekierman-panel.service <<'EOF'
[Unit]
Description=zekierman.me panel
After=network.target

[Service]
Type=simple
User=zeki
WorkingDirectory=/home/zeki/site/admin
Environment=NODE_ENV=production
Environment=PORT=4322
Environment=HOST=127.0.0.1
# Panelin commit'lerini GitHub'a da göndersin (5. adımdaki deploy anahtarı şart)
Environment=GIT_PUSH=1
ExecStart=/usr/bin/node server.mjs
Restart=on-failure
RestartSec=3

# Servis sadece kendi işini görebilsin
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=read-only
ReadWritePaths=/home/zeki/site

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now zekierman-panel
systemctl status zekierman-panel --no-pager
```

---

## 8 — nginx

```bash
cat >/etc/nginx/sites-available/zekierman.me <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name zekierman.me www.zekierman.me;
    root /home/zeki/site/dist;
    index index.html;

    # Hero filmi scroll ile kaydırılıyor; bu range istekleriyle çalışıyor.
    # Kapatılırsa her seek dosyayı baştan indirir ve kaydırma tutuklaşır.
    location /media/ {
        add_header Accept-Ranges bytes;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Panel. Loopback'te dinliyor, dışarıdan yalnızca buradan geçilir.
    location /admin {
        proxy_pass http://127.0.0.1:4322;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 16m;      # görsel yüklemesi için
    }

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}
EOF

ln -sf /etc/nginx/sites-available/zekierman.me /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
chmod o+x /home/zeki                 # nginx dist/ klasörünü okuyabilsin
nginx -t && systemctl reload nginx
```

---

## 9 — DNS

Alan adının yönetim panelinde iki kayıt:

| Tip | Ad | Değer |
|---|---|---|
| A | `@` | SUNUCU_IP |
| A | `www` | SUNUCU_IP |

Yayılmasını bekle, sonra doğrula:

```bash
dig +short zekierman.me
```

IP'yi görene kadar bir sonraki adıma geçme — sertifika alan adı üzerinden doğrulanıyor.

---

## 10 — HTTPS

```bash
apt -y install certbot python3-certbot-nginx
certbot --nginx -d zekierman.me -d www.zekierman.me
```

Certbot nginx dosyasını kendisi düzenler ve 80'i 443'e yönlendirir. Yenileme otomatik.

**Bu adımdan önce panele girme.** Oturum çerezi `Secure` işaretli, yani HTTPS olmadan
tarayıcı onu göndermez ve giriş yapamazsın. (Sadece test için `INSECURE_COOKIE=1` var,
canlıda asla kullanma.)

---

## 11 — Kontrol

```bash
curl -I https://zekierman.me                       # 200
curl -I https://zekierman.me/en/                   # 200
curl -sI https://zekierman.me/tr/ | head -3        # 200, sayfa / adresine yönlendiriyor
curl -sI -H 'Range: bytes=0-99' https://zekierman.me/media/chasing-light-1080.mp4 | head -3
#   206 Partial Content görmelisin — hero'nun kaydırması buna bağlı
```

Sonra tarayıcıdan `https://zekierman.me/admin` — parolanı gir, bir proje ekle,
birkaç saniye sonra ana sayfada görünmeli.

---

## 12 — GitHub katkı grafiği

Lab'daki katkı grafiği canlı çekilmiyor. `tools/fetch-github.mjs` veriyi
`src/content/github-activity.json` dosyasına yazıyor, sayfa yalnızca o dosyayı
okuyor. Böylece derleme ağa hiç çıkmıyor (14,5 sn → 2,3 sn), token bir bileşene
hiç yaklaşmıyor, ve GitHub çökse bile son geçerli grafik sayfada duruyor.

Token sunucunun ortam değişkeninde durur, panelde değil:

```bash
sudo -iu zeki bash -c 'umask 077; printf "GITHUB_TOKEN=%s
" "TOKENI_BURAYA_YAZ" > ~/site/.env'
```

> Bu komutu **sen** çalıştır ve token'ı kendin yaz. `.env` git'e girmez.

Günde bir kez yenilesin (gece 03:00). Veri değişmediyse commit de atmaz:

```bash
sudo -iu zeki crontab -e
```

```cron
0 3 * * * cd $HOME/site && set -a && . ./.env && set +a && node tools/fetch-github.mjs >> $HOME/github.log 2>&1 && git diff --quiet src/content/github-activity.json || (git add src/content/github-activity.json && git commit -q -m "Refresh the contribution calendar" && npm run build)
```

Betik ağa çıkamazsa dosyaya dokunmaz ve `0` ile çıkar — yani başarısız bir gece
sessizce geçer, site kırılmaz.

## Günlük işler

```bash
# panel günlüğü
journalctl -u zekierman-panel -f

# koddan güncelleme (panelden değil, benden gelen değişiklikler)
sudo -iu zeki bash -c 'cd ~/site && git pull && npm ci && npm run build'

# panel yeniden başlat
sudo systemctl restart zekierman-panel

# parolayı değiştir (tüm açık oturumları da düşürür)
sudo -iu zeki bash -c 'cd ~/site/admin && npm run set-password'
sudo systemctl restart zekierman-panel
```

## Sunucu sıfırlanırsa

İçerik kaybolmaz — projeler ve görseller GitHub'da. Bu dosyayı baştan uygula, tek fark
6. adımda parolayı yeniden belirlemen olur.
