FROM node:14-alpine
RUN apk --no-cache add --virtual .builds-deps build-base python3
WORKDIR /usr/src/app

# 의존성 패키지 설치
COPY package*.json yarn.lock .yarn .yarnrc.yml ./
RUN yarn install
COPY . .

# ENV NODE_OPTIONS --openssl-legacy-provider

# 타임존을 UTC로 설정
RUN apk add --no-cache tzdata
RUN echo 'Etc/UTC' > /etc/timezone

# 빌드 및 시작
RUN yarn build
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
ENV NODE_ENV production
CMD [ "yarn", "start:prod" ]