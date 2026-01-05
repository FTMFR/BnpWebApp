# Stage 1: Build the application
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with serve
FROM node:20-alpine

WORKDIR /app

# نصب serve
RUN npm install -g serve

# کپی فایل‌های build شده
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]