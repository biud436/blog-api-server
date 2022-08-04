# Introduction

This project will introduce you to the basic elements of blog implementation. Learning something new is always a little daunting at first. but I think that things will start to become familiar in no time.

## Server application

In this directory named `backend` will finish off the features of our server by adding a lot of controllers, services, pipes of `Nest.js` for blog service.

-   Nest.js
-   TypeORM
-   MariaDB
-   Redis

Before start the server application, you have to create some file such as `.development.env` and `.env` and then you should set the following environment variables.

```bash
DB_HOST=localhost
DB_PASSWORD=1234
DB_USER=admin
DB_NAME=test
DB_PORT=3306
DOCS_USERNAME=admin
DOCS_PASSWORD=1234
JWT_SECRET=<YOUR_SECRET>
JWT_SECRET_EXPIRATION_TIME=2h
JWT_REFRESH_TOKEN_SECRET=<YOUR_SECRET>
JWT_REFRESH_TOKEN_EXPIRATION_TIME=14d
PUBLIC_SERVER_IP=http://localhost:3000
PASSWORD_JWT_SECRET=<YOUR_SECRET>
MAIL_XOR_KEY=<6_digit_number>
GMAIL_USERNAME=<YOUR_ID>@gmail.com
GMAIL_PASSWORD=<ENCRYPTED_PASSWORD>
DAUM_USERNAME=<YOUR_ID>@daum.net
DAUM_PASSWORD=<ENCRYPTED_PASSWORD>
NAVER_USERNAME=<YOUR_ID>@naver.com
NAVER_PASSWORD=<ENCRYPTED_PASSWORD>
AES_256_KEY=<YOUR_SECRET>
AES_256_IV=<YOUR_SECRET>
```

However it is hard to set the environment variables manually, so I recommend you to use terminal command that can set them automatically.

To set the environment variables automatically, you can use the command line.

```
yarn start env
```

The Nest.js version is using a version released in March 2021.

## Devops environment

In directories called `devops` and `rdb-devops`, there is the yaml file ends with `docker-compose.yml` that can use in the the Docker. These files will create and execute a docker image in your linux or macos due to a Dockerfile of corresponding folder.

-   Nginx
-   Docker

You can run the web server, database, and others in certain environments such as `linux (Ubuntu Server 20.04)` or `MacOS (Apple M1 Silicon)` only. (Do not run it on Windows)

The certification file didn't contain in this project, because it performs a many of security issues.
