<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/badge/nest-10.1.2-red?logo=nestjs" alt="NPM Version" /></a>

# Introduction

This project is the blog server that is made with the server framework called nestjs@v10.0.0, it is also included devops file that allows you to set and start the blog server using docker. This will introduce you to the basic elements of blog implementation. Learning something new is always a little daunting at first. but I think that things will start to become familiar in no time.

<p align="center">
<img src="https://github.com/biud436/blog-api-server/assets/13586185/da61b066-2159-4662-a8fb-0172d9baffe9" />
</p>

# Setting up the server

In this directory named `backend` will finish off the features of our server by adding a lot of controllers, services, pipes of `Nest.js` for blog service.

- Nest.js
- TypeORM
- MariaDB
- Redis

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
GITHUB_CLIENT_ID=<YOUR_ID>
GITHUB_CLIENT_SECRET=<YOUR_SECRET>
GITHUB_CALLBACK_URL=http://127.0.0.1:3000/auth/github/callback
APP_SECRET=<YOUR_SECRET>
GITHUB_REDIRECT_URI=http://localhost:8080/github/callback
AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
AWS_S3_BUCKET_NAME=<YOUR_S3_BUCKET_NAME>
SLACK_WEBHOOK_URL=<YOUR_SLACK_WEBHOOK_URL>
```

However it is hard to set the environment variables manually, so I recommend you to use terminal command that can set them automatically.

To set the environment variables automatically, you can use the command line.

```
yarn start env
```

# Devops environment

In directories called `devops` and `rdb-devops`, there is the yaml file ends with `docker-compose.yml` that can use in the the Docker. These files will create and execute a docker image in your linux or macos due to a Dockerfile of corresponding folder.

- Nginx
- Docker

You can run the web server, database, and others in certain environments such as `linux (Ubuntu Server 20.04)` or `MacOS (Apple M1 Silicon)` only. (Do not run it on Windows)

The certification file didn't contain in this project, because it performs a many of security issues.

# Main Features

## `Sign-in` and `Sign-up` with Admin Role

To sign-up the our blog members, You will have to receive the authorization code to the verified email, this server contains the feature can check whether the authorization code is expired using Redis TTL Key.

## Github Profile Image

To show in your github account's README.md below the profile image, you can use the following code.

<p align="center">
<img src="https://blog-api.biud436.com/image/shake-profile?text=I%27m%20a%20Backend%20Server%20Application%20Developer.&color=ffffff&textSize=20&y=150&username=biud436" />
</p>

```markdown
![](https://blog-api.biud436.com/image/shake-profile?text=I%27m%20a%20Backend%20Server%20Application%20Developer.&color=ffffff&textSize=20&y=150&username=biud436)
```

### Parameters

> text : The text that you want to display on the profile image (Encode the text using `encodeURIComponent`)

> color : The color of the text for future use.

> username : The username of the github account.

> textSize : The size of the text.

> y: The y position of the text.

## Hierarchical Categories

To pass the parameter key and value named `isBeautify=true`, you can get the hierarchical categories. This feature is implemented by using data structure called Nested Set. The nested set is a data structure that allows you to store hierarchical data in a database table. It is a very efficient way to store hierarchical data in a database, so you can lookup the parent category or leaf category in the front-end efficiently.

<p align="center">
<img width="347" alt="image" src="https://user-images.githubusercontent.com/13586185/192088652-7b5ece18-7612-4e47-9d20-8c9796f97f20.png">
</p>

[https://jsfiddle.net/d8tuapvg/](https://jsfiddle.net/d8tuapvg/)

> [GET] {{API_URL}}/admin/category?isBeautify=true

```json
{
  "message": "데이터 조회 성공",
  "statusCode": 200,
  "result": "success",
  "data": [
    {
      "children": [
        {
          "children": [
            {
              "children": [],
              "name": "강좌",
              "left": 3,
              "right": 4,
              "depth": 2
            }
          ],
          "name": "C++",
          "left": 2,
          "right": 5,
          "depth": 1
        },
        {
          "children": [
            {
              "children": [],
              "name": "자바 강좌",
              "left": 7,
              "right": 8,
              "depth": 2
            }
          ],
          "name": "Java",
          "left": 6,
          "right": 9,
          "depth": 1
        },
        {
          "children": [],
          "name": "Ruby",
          "left": 10,
          "right": 11,
          "depth": 1
        }
      ],
      "name": "IT",
      "left": 1,
      "right": 12,
      "depth": 0
    }
  ]
}
```

## Flat Categories

if pass the parameter is the same as `isBeautify=false`, you can get the flat categories. it can be represented as a data structure such as `["Current Category", "Parent Category", "Category Depth"]`

> {{API_URL}}/admin/category

```json
{
  "message": "데이터 조회 성공",
  "statusCode": 200,
  "result": "success",
  "data": [
    ["IT", "", 0],
    ["C++", "IT", 1],
    ["강좌", "C++", 2],
    ["Java", "IT", 1],
    ["자바 강좌", "Java", 2],
    ["Ruby", "IT", 1]
  ]
}
```

## Posts

The posts are the main feature of this blog service. The posts can be created, updated, deleted by the Admin role, and the read by everyone. The posts can be categorized by the category that you created before. A many people can be obtained the admin role, However notice that only one person can be the owner of the blog service.

### BreadCrumbs

> [GET] {{API_URL}}/posts/breadcrumbs?categoryName=자바 강좌

[https://blog-api.biud436.com/posts/breadcrumbs?categoryName=javascript](https://blog-api.biud436.com/posts/breadcrumbs?categoryName=javascript)

```json
{
  "message": "데이터 조회 성공",
  "statusCode": 200,
  "result": "success",
  "data": "IT > Java > 자바 강좌"
}
```

# Upgrade modules

To upgrade the `@nestjs/*` version, you have to do the following.

```bash
yarn upgrade --pattern @nestjs --latest
```

Note that some features may be `deprecated` due to dependencies update.

## Upgrade frontend submodule

To upgrade the sub module, you have to do the following.

```bash
git submodule update --remote
```
