# Introduction

This project will introduce you to the basic elements of blog implementation. Learning something new is always a little daunting at first. but I think that things will start to become familiar in no time.

# 주요 기능

## 관리자 회원 가입 및 로그인

SMTP를 통해 직접 이메일을 전송하여 인증 코드를 받고 레디스 TTL 기능을 통해 인증 코드를 만료 및 유효성을 확인하는 기능이 포함되어 있습니다.

## 카테고리 계층적 관리

카테고리를 계층화하여 추가하거나 부모 카테고리나 종단 카테고리 등을 조회할 수 있습니다.

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
                            "left": 3,
                            "name": "  강좌",
                            "depth": 2
                        }
                    ],
                    "left": 2,
                    "name": " C++",
                    "depth": 1
                },
                {
                    "children": [],
                    "left": 6,
                    "name": " Java",
                    "depth": 1
                },
                {
                    "children": [],
                    "left": 8,
                    "name": " Ruby",
                    "depth": 1
                }
            ],
            "left": 1,
            "name": "IT",
            "depth": 0
        }
    ]
}
```

## 글 작성

블로그 관리자로 지정된 유저는 한 명이 아닐 수 있습니다. 다수의 관리자가 글을 작성할 수 있습니다.

## 글 조회

글을 페이지네이션하여 조회합니다.

```json
{
    "message": "데이터 조회 성공",
    "statusCode": 200,
    "result": "success",
    "data": {
        "pagination": {
            "currentPage": 1,
            "totalCount": 1,
            "maxPage": 1,
            "currentBlock": 1,
            "maxBlock": 1
        },
        "entities": [
            {
                "id": 31,
                "title": "C++ 강좌 시작합니다~",
                "content": "C++ 강좌 조만간 시작합니다.",
                "uploadDate": "2022-08-27T04:29:32.000Z",
                "user": {
                    "username": "biud436",
                    "profile": {
                        "nickname": "러닝은빛"
                    }
                },
                "category": {
                    "name": "C++"
                },
                "viewCount": {
                    "count": 0
                }
            }
        ]
    }
}
```

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

## Devops environment

In directories called `devops` and `rdb-devops`, there is the yaml file ends with `docker-compose.yml` that can use in the the Docker. These files will create and execute a docker image in your linux or macos due to a Dockerfile of corresponding folder.

-   Nginx
-   Docker

You can run the web server, database, and others in certain environments such as `linux (Ubuntu Server 20.04)` or `MacOS (Apple M1 Silicon)` only. (Do not run it on Windows)

The certification file didn't contain in this project, because it performs a many of security issues.
