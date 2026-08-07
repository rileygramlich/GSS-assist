# Build the static bundle inside Docker so only ~140KB of source has to reach
# the VPS — no node_modules, no lockfile, no committed build output.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY public ./public
COPY src ./src
RUN npm run build

# nginx serves the result. Nothing here shares a layer, a process, or a restart
# with the assistant container — the phone line is untouched by site deploys.
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=60s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
