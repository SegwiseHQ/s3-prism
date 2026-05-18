FROM node:22-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY .env .env
COPY src src

CMD ["npm", "start"]
