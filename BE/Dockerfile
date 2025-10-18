FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npm run db:generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
