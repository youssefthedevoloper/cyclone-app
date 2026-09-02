FROM node:22-slim
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit
COPY . .
RUN npx tsc
EXPOSE 3000
CMD ["node", "start.js"]
