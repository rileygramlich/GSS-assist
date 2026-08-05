FROM node:20-alpine

WORKDIR /app

# Install deps as a separate layer so code changes don't re-run npm ci.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

# /app/data is the volume mount point for calls.jsonl. Owned by node so the
# unprivileged runtime user can actually write to it.
RUN mkdir -p /app/data && chown -R node:node /app
USER node

ENV NODE_ENV=production \
    PORT=3000 \
    CALL_LOG=/app/data/calls.jsonl

EXPOSE 3000

# Compose restarts the container when this goes unhealthy. A phone line that is
# up but not answering is worse than one that is visibly down.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "src/server.js"]
