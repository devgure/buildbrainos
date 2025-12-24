FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build || true
RUN if [ -d "./prisma" ]; then npx prisma generate --schema=prisma/schema.prisma || true; fi
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production || true
COPY . .
EXPOSE 4003
CMD ["node","src/main.js"]
