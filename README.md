# 소개

이 프로젝트는 NestJS(`@nestjs@v9.0.11`) 2022.08.16 버전으로 만들어진 간단한 블로그 서버이며 인프라 파일 또한 포함되어있습니다.

# 주요 기능

## 관리자 회원 가입 및 로그인

SMTP를 통해 직접 이메일을 전송하여 인증 코드를 받고 레디스 TTL 기능을 통해 인증 코드를 만료 및 유효성을 확인하는 기능이 포함되어 있습니다.

## 카테고리 계층적 관리

카테고리를 계층화하여 추가하거나 부모 카테고리나 종단 카테고리 등을 조회할 수 있습니다. 카테고리는 중첩 모델(Nested set)로 구현되어있습니다.

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

## 전체글 또는 카테고리 별 글 조회

게시글을 카테고리 별 또는 전체글로 페이지네이션하여 조회할 수 있습니다. 업데이트가 빈번한 조회수는 레디스를 통해 관리됩니다.

포스트 조회 시, 조회수 증감으로 인하여 추후 캐시를 적용하여 빠른 성능을 낼 때, 변하는 값인 조회수로 인해 캐시 적용에 작은 우려가 있어 미리 메모리 디비로 분리한 것입니다.

전체 포스트 조회는 대게 관리자가 관리자 대시보드를 통하여 게시물 통계를 확인할 때 사용하므로 스케줄러를 통해 밤에 조회수를 집계하도록 하여 DB에 반영하도록 하였습니다.

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

## 댓글 작성과 조회

특정 포스트의 댓글을 조회할 수 있습니다. 댓글은 경로 열거(`Path Enumeration`) 모델을 사용하였습니다.

```sql
SELECT
    *
FROM
    test.post_comment
WHERE
    mpath LIKE '3.%' AND post_id = 31
ORDER BY created_at;
```

중첩 모델은 카테고리나 루트가 하나인 조직도에는 유용하나, 업데이트가 빈번한 댓글 또는 루트가 여러개일 수도 있는 댓글 시스템에서는 적절하지 않은 모델이었습니다.

또한 댓글 삭제나 새로운 댓글 추가 시, 나머지 노드의 위치를 갱신해야 하는 성능상의 문제가 있었습니다.

따라서 댓글 작성에는 경로 열거 방식을 사용하였으며 위 쿼리를 통해 3번 댓글의 자식 댓글을 간단하게 조회가 가능하였으므로 이를 적용하였습니다.

그러나 상위 댓글 삭제 시, 계층이 무너질 우려가 있어서 댓글의 내용만 지우는 트릭을 사용해야 했습니다.

```json
{
    "message": "데이터 조회 성공",
    "statusCode": 200,
    "result": "success",
    "data": {
        "pagination": {
            "currentPage": 1,
            "totalCount": 9,
            "maxPage": 1,
            "currentBlock": 1,
            "maxBlock": 1
        },
        "entities": [
            {
                "id": 1,
                "username": "test",
                "content": "댓글 테스트",
                "postId": 31,
                "path": "",
                "depth": 0,
                "parentId": null
            },
            {
                "id": 2,
                "username": "test",
                "content": "대댓글 테스트",
                "postId": 31,
                "path": "",
                "depth": 0,
                "parentId": 1
            },
            {
                "id": 3,
                "username": "test",
                "content": "test",
                "postId": 31,
                "path": "3.",
                "depth": 1,
                "parentId": null
            },
            {
                "id": 5,
                "username": "test",
                "content": "test",
                "postId": 31,
                "path": "3.5.",
                "depth": 2,
                "parentId": 3
            },
            {
                "id": 6,
                "username": "test",
                "content": "test",
                "postId": 31,
                "path": "3.6.",
                "depth": 2,
                "parentId": 3
            },
            {
                "id": 9,
                "username": "test3",
                "content": "62154",
                "postId": 31,
                "path": "3.6.9.",
                "depth": 3,
                "parentId": 6
            },
            {
                "id": 7,
                "username": "test",
                "content": "test",
                "postId": 31,
                "path": "3.7.",
                "depth": 2,
                "parentId": 3
            },
            {
                "id": 8,
                "username": "test",
                "content": "test",
                "postId": 31,
                "path": "3.8.",
                "depth": 2,
                "parentId": 3
            },
            {
                "id": 4,
                "username": "test",
                "content": "test",
                "postId": 31,
                "path": "4.",
                "depth": 1,
                "parentId": 1
            }
        ]
    }
}
```

## 노드 모듈 업그레이드

업그레이드된 `@nestjs` 버전으로 갱신하려면 다음과 같이 해야 합니다.

```bash
yarn upgrade --pattern @nestjs --latest
```

버전 업그레이드에 따라 특정 기능이 `deprecated` 될 수도 있습니다.

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

## Devops environment

In directories called `devops` and `rdb-devops`, there is the yaml file ends with `docker-compose.yml` that can use in the the Docker. These files will create and execute a docker image in your linux or macos due to a Dockerfile of corresponding folder.

-   Nginx
-   Docker

You can run the web server, database, and others in certain environments such as `linux (Ubuntu Server 20.04)` or `MacOS (Apple M1 Silicon)` only. (Do not run it on Windows)

The certification file didn't contain in this project, because it performs a many of security issues.
