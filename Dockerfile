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

# Fix PDFKit font data paths for production
# PDFKit looks for fonts relative to the bundled route file location
# Copy font data to ALL possible locations where PDFKit might look
RUN echo "==== Fixing PDFKit font data paths ====" && \
    if [ -d /app/node_modules/pdfkit/js/data ]; then \
      echo "✓ PDFKit source data found in node_modules"; \
      echo "Copying to multiple locations..."; \
      mkdir -p /app/.next/server/app/api/crm/documents/\[id\]/pdf && \
      cp -r /app/node_modules/pdfkit/js/data /app/.next/server/app/api/crm/documents/\[id\]/pdf/data && \
      echo "✓ Copied to: .next/server/app/api/crm/documents/[id]/pdf/data"; \
      mkdir -p /app/.next/server/app/api/crm/documents && \
      cp -r /app/node_modules/pdfkit/js/data /app/.next/server/app/api/crm/documents/data && \
      echo "✓ Copied to: .next/server/app/api/crm/documents/data"; \
      mkdir -p /app/.next/server && \
      cp -r /app/node_modules/pdfkit/js/data /app/.next/server/data && \
      echo "✓ Copied to: .next/server/data"; \
      echo "==== PDFKit font data setup complete ===="; \
    else \
      echo "✗ CRITICAL ERROR: PDFKit font data not found in node_modules!"; \
      exit 1; \
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
