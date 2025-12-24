FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "dist/main.js"]
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production || true
COPY . .
EXPOSE 4007
CMD ["node","src/main.js"]
