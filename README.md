<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/badge/nest-9.3.2-red" alt="NPM Version" /></a>

# Introduction

This project is the blog server that is made with the server framework called nestjs@v9.1.4, it is also included devops file that allows you to set and start the blog server using docker. This will introduce you to the basic elements of blog implementation. Learning something new is always a little daunting at first. but I think that things will start to become familiar in no time.

# Setting up the server

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

-   Nginx
-   Docker

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

### Lookup Posts

게시글을 카테고리 별 또는 전체글로 페이지네이션하여 조회할 수 있습니다. 업데이트가 빈번한 조회수는 레디스를 통해 관리됩니다.

포스트 조회 시, 조회수 증감으로 인하여 추후 캐시를 적용하여 빠른 성능을 낼 때, 변하는 값인 조회수로 인해 캐시 적용에 작은 우려가 있어 미리 메모리 디비로 분리한 것입니다.

전체 포스트 조회는 대게 관리자가 관리자 대시보드를 통하여 게시물 통계를 확인할 때 사용하므로 스케줄러를 통해 밤에 조회수를 집계하도록 하여 DB에 반영하도록 하였습니다.

> [GET] {{API_URL}}/posts?categoryId=&page=1

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

## Comments

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

> [GET] {{API_URL}}/posts/31/comment?parentCommentId=1&page=1

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

# Upgrade modules

업그레이드된 `@nestjs` 버전으로 갱신하려면 다음과 같이 해야 합니다.

```bash
yarn upgrade --pattern @nestjs --latest
```

버전 업그레이드에 따라 특정 기능이 `deprecated` 될 수도 있습니다.
