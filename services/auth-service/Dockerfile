FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "src/main.js"]
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
EXPOSE 4001
CMD ["npm","start"]
