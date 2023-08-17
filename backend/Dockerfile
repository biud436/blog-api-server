FROM node:16-alpine as builder

RUN apk --no-cache add --virtual .builds-deps build-base python3
RUN apk add --no-cache tzdata && \
    echo 'Etc/UTC' > /etc/timezone

WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .

RUN yarn build

FROM node:16-alpine

# 멀티스테이지 빌드를 사용하여 필요한 파일만 복사한다.
COPY --from=builder /usr/src/app/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules 
COPY --from=builder /usr/src/app/.config.yaml ./.config.yaml
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/views ./views

EXPOSE 3000
ENV NODE_ENV production
CMD [ "node", "./dist/main" ]