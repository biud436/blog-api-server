FROM node:16

ENV PORT 8080

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY ./ ./

ENV NODE_ENV production

RUN npm run build

CMD ["npm", "run", "start", "--", "--port", "8080"]