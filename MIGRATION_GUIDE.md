# Production Migration Guide

## 🚀 Production дээр Migration хийх арга замууд

### Арга 1: Автоматаар (Dockerfile - одоо байгаа)

Dockerfile дотор аль хэдийн migration байна:
```dockerfile
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py ensure_superuser && gunicorn driver_rating.wsgi:application --bind 0.0.0.0:$PORT"]
```

**Давуу тал:**
- Автоматаар migration хийгддэг
- Container эхлэх бүрт шинэ migration-ууд хийгддэг

**Сул тал:**
- Олон container параллель ажиллаж байвал migration дахин ажиллах боломжтой
- Migration алдаа гарвал container эхлэхгүй

---

### Арга 2: Render Postdeploy Script (Зөвлөмж)

Render дээр `render.yaml` файл ашиглах:

1. **render.yaml** файл үүсгэх (аль хэдийн үүсгэсэн)
2. Render dashboard дээр:
   - Settings → Build & Deploy
   - Postdeploy Command: `python manage.py migrate --noinput`

**Давуу тал:**
- Deployment-ийн дараа зөвхөн нэг удаа migration хийгддэг
- Migration алдаа гарвал deployment fail хийгддэг

---

### Арга 3: Manual Migration (Аваар бол)

#### Render Shell ашиглах:

1. Render dashboard → Your Service → Shell
2. Дараах командууд ажиллуулах:
```bash
cd /app
python manage.py migrate --noinput
```

#### Docker Container дотор:

```bash
# Container ID олох
docker ps

# Container дотор орж migration ажиллуулах
docker exec -it <container_id> python manage.py migrate --noinput
```

#### Render CLI ашиглах:

```bash
# Render CLI суулгах
npm install -g render-cli

# Login хийх
render login

# Service-ийн shell-д орох
render shell <service-name>

# Migration ажиллуулах
python manage.py migrate --noinput
```

---

## ⚠️ Чухал зүйлс

1. **Migration-уудыг урьдчилан шалгах:**
   ```bash
   python manage.py migrate --plan
   ```

2. **Backup хийх:**
   - Production database-ийн backup урьдчилан хийх
   - Migration хийхээсээ өмнө backup байгаа эсэхийг шалгах

3. **Migration lock:**
   - Олон container ажиллаж байвал migration lock хэрэгтэй
   - Django-ийн `django-pglocks` package ашиглаж болно

4. **Rollback бэлдэх:**
   - Migration алдаа гарвал rollback хийх төлөвлөгөөтэй байх

---

## 📝 Шинэ Migration нэмэх үед

1. **Local дээр migration үүсгэх:**
   ```bash
   python manage.py makemigrations
   ```

2. **Git push хийх:**
   ```bash
   git add backend/surveys/migrations/
   git commit -m "Add performance indexes migration"
   git push
   ```

3. **Production дээр автоматаар migration хийгдэнэ:**
   - Dockerfile-ийн дагуу container restart хийхэд migration хийгдэнэ
   - Эсвэл Render postdeploy script ажиллана

---

## 🔍 Migration статус шалгах

Production дээр migration статус шалгах:
```bash
python manage.py showmigrations
```

Migration хийгдсэн эсэхийг шалгах:
```bash
python manage.py migrate --plan
```

---

## 🎯 Одоогийн Migration (0006_add_performance_indexes)

Энэ migration нь:
- Database index-ууд нэмнэ
- Query performance сайжруулна
- Жагсаалт дата 10 секундээс 1-3 секунд болтол хурдасгана

Migration ажиллуулах:
```bash
python manage.py migrate surveys 0006_add_performance_indexes
```

Эсвэл бүх migration:
```bash
python manage.py migrate
```
