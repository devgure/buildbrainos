FROM node:18
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build || true
RUN if [ -d "./prisma" ]; then npx prisma generate --schema=prisma/schema.prisma || true; fi
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
EXPOSE 5001
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
