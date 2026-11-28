FROM node:24.22.3-alpine as builder
ENV NODE_ENV production

RUN apk --no-cache add --virtual .builds-deps build-base python3
RUN apk add --no-cache tzdata && \
    echo 'Etc/UTC' > /etc/timezone

WORKDIR /usr/src/app

COPY . .

RUN yarn install
RUN yarn build

FROM node:24.22.3-alpine

WORKDIR /app

# 멀티스테이지 빌드를 사용하여 필요한 파일만 복사한다.
COPY --from=builder /usr/src/app/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/dist /app/dist
COPY --from=builder /usr/src/app/.config.yaml /app/.config.yaml
COPY --from=builder /usr/src/app/public /app/public
COPY --from=builder /usr/src/app/views /app/views

# Yarn Berry 적용
COPY --from=builder /usr/src/app/.pnp.cjs /app/.pnp.cjs
# NestJS 12 는 ESM 전용 패키지라 PnP ESM 로더가 없으면 ERR_MODULE_NOT_FOUND 로 부팅에 실패한다.
COPY --from=builder /usr/src/app/.pnp.loader.mjs /app/.pnp.loader.mjs
COPY --from=builder /usr/src/app/.yarnrc.yml /app/.yarnrc.yml
COPY --from=builder /usr/src/app/.yarn /app/.yarn
COPY --from=builder /usr/src/app/package.json /app/package.json
COPY --from=builder /usr/src/app/yarn.lock /app/yarn.lock

EXPOSE 3000
ENV NODE_ENV production
CMD [ "yarn", "start:prod"]