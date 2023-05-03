FROM node:18-alpine

WORKDIR /app

COPY package*.json /app

COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate


COPY . .

EXPOSE 5000


CMD ["npm", "run", "dev"]