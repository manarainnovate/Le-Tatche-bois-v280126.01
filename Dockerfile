FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Set PDFKit font path for production
ENV PDFKIT_FONT_PATH=/app/node_modules/pdfkit/js/data
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# PDFKit is now externalized in next.config.mjs (serverExternalPackages)
# This means it runs directly from node_modules without webpack bundling
# Font files are automatically accessible at their original paths
# Verify PDFKit is properly installed
RUN if [ ! -d /app/node_modules/pdfkit ]; then \
      echo "✗ CRITICAL ERROR: PDFKit not found in node_modules!"; \
      exit 1; \
    else \
      echo "✓ PDFKit found in node_modules (externalized - fonts accessible)"; \
    fi

# Create uploads directory structure with correct permissions
RUN mkdir -p /app/public/uploads && \
    chown -R nextjs:nodejs /app/public && \
    chmod -R 755 /app/public

# Declare volume for persistent uploads storage
# This ensures uploaded files persist across container restarts/redeploys
VOLUME ["/app/public/uploads"]

USER nextjs
EXPOSE 3000
CMD ["npx", "next", "start"]
