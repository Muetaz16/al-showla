# Deploying Al-Showla to the VPS (Docker, production)

Target: Ubuntu 26.04 VPS (`vps.shola.ly`, 16 GB RAM / 4 vCPU / 160 GB).
Stack: Next.js 16 + Prisma 7 + PostgreSQL, all in Docker Compose.

The database is created automatically on first boot: `npm run start` runs
`prisma db push`, which creates every table from `prisma/schema.prisma`.
No manual migration step is needed. Content (FAQ, blog, products…) seeds itself
on first use.

---

## 0. DNS (once)
Make sure `vps.shola.ly` has an **A record** pointing to the VPS's public IP.
Check from your laptop: `ping vps.shola.ly` should show the VPS IP.

## 1. SSH into the VPS
```bash
ssh root@vps.shola.ly
```

## 2. Install Docker + Compose plugin
```bash
apt-get update
apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
docker --version && docker compose version
```
> If Ubuntu 26.04's codename isn't in Docker's repo yet, replace
> `$(. /etc/os-release && echo $VERSION_CODENAME)` with `noble`.

## 3. Get the code
```bash
cd /opt
git clone https://github.com/Muetaz16/al-showla.git shola
cd shola
```

## 4. Create the environment file
```bash
cp .env.production.example .env
# generate strong secrets:
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"   # copy into .env
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"  # copy into .env
nano .env
```
Fill in `.env`:
- `POSTGRES_PASSWORD` – the random value above
- `NEXTAUTH_SECRET`  – the random value above
- `NEXTAUTH_URL=https://vps.shola.ly`
- `NEXT_PUBLIC_SITE_URL=https://vps.shola.ly`
- `GEMINI_API_KEY=` – (optional) your Gemini key for the AI advisor

## 5. Build & start (app + database)
```bash
docker compose up -d --build
```
First build takes a few minutes. Watch the app come up:
```bash
docker compose logs -f app
```
You want to see `prisma db push` finish and Next report it's **Ready**.
(Press Ctrl-C to stop watching; the containers keep running.)

## 6. Verify the database is ready
```bash
# tables created by prisma db push:
docker compose exec db psql -U shola -d shola -c '\dt' | head -40
# app answering:
curl -I http://localhost:3000
```
You should see a list of tables (User, Order, Product, FaqItem, …) and `HTTP/1.1 200`.

## 7. Enable HTTPS (automatic Let's Encrypt via Caddy)
Edit `Caddyfile` if your domain differs, then:
```bash
docker compose --profile proxy up -d
docker compose logs -f caddy      # watch the certificate get issued
```
Now browse **https://vps.shola.ly**.

## 8. Firewall
```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
# optional: stop exposing the raw app port once Caddy works
# (remove the "3000:3000" line from docker-compose.yml, then `docker compose up -d`)
ufw enable
```

---

## Updating after new commits
```bash
cd /opt/shola
git pull
docker compose up -d --build
```

## Useful commands
```bash
docker compose ps                 # status
docker compose logs -f app        # app logs
docker compose restart app        # restart app only
docker compose down               # stop everything (keeps the DB volume)
docker compose exec db pg_dump -U shola shola > backup-$(date +%F).sql   # DB backup
```

## Notes
- The admin panel lives at `/admin/login`. Those admin accounts are app-level
  (not NextAuth) and work immediately — change those passwords in code before go-live.
- The product catalog is currently served from a static file, so it shows up with
  no database rows. Orders, contractor portal, CMS and auth use Postgres.
- Postgres data persists in the `pgdata` Docker volume across restarts/rebuilds.
