# Build the bundle inside Docker so only the source has to reach the VPS —
# no node_modules, no lockfile-sized upload, no committed build output.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

# nginx serves the static site and proxies /api to the text server. Nothing
# here shares a layer, a process, or a restart with either assistant container:
# a site deploy cannot interrupt a live call or a live text thread.
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=60s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
