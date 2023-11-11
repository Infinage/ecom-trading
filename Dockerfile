FROM node:21.1.0-slim
WORKDIR /app

COPY front-end ./front-end
COPY back-end ./back-end
COPY package-lock.json ./
COPY package.json ./

RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start"]