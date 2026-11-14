# ---------- build stage ----------
FROM node:22-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma needs openssl at generate/push time
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# puppeteer is a dev-only tool that is never imported at runtime — skip its
# Chrome download so the image stays small and the install doesn't fail.
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci

COPY . .

# NEXT_PUBLIC_* values are embedded into the client bundle at BUILD time.
ARG NEXT_PUBLIC_SITE_URL=https://vps.shola.ly
ARG NEXT_PUBLIC_GA_ID=
ARG NEXT_PUBLIC_FB_PIXEL_ID=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID \
    NEXT_PUBLIC_FB_PIXEL_ID=$NEXT_PUBLIC_FB_PIXEL_ID

# prisma generate + next build (no DB needed at build)
RUN npm run build

# ---------- runtime stage ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Bring over the built app + node_modules (includes the Prisma CLI for `db push`)
COPY --from=build /app ./

EXPOSE 3000
# `npm run start` = `prisma db push` (creates/updates tables) then `next start`
CMD ["npm", "run", "start"]
