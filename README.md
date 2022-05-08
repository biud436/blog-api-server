# Introduction

This project will introduce you to the basic elements of blog implementation. Learning something new is always a little daunting at first. but I think that things will start to become familiar in no time.

## Server application

`backend` 폴더에는 블로그 API 서버가 `Nest.js`라는 서버 프레임워크로 구현되어있습니다.

-   Nest.js
-   TypeORM
-   MariaDB
-   Redis

데이터베이스 연결과 스웨거 문서 생성에 대한 모든 개인 정보 설정은 `nest build env` 와 `yarn start env` 명령을 통해 수행할 수 있습니다.

오랜 기간 사용해왔기 때문에 레거시한 코드가 많으며, Nest.js 버전도 21년 03월에 출시된 버전을 쓰고 있습니다.

## Devops environment

`devops`와 `rdb-devops` 폴더에는 `Docker` 기반 개발 환경 구축을 위한 파일들이 있습니다.

-   Nginx
-   Docker

웹 서버는 도커를 사용할 수 있는 리눅스(**우분투 서버 20.04**)나 맥 환경에서 실행해야 합니다.

실무와는 거리가 먼 구성이지만 블로그 서버를 돌리기에는 적합하다고 생각합니다.

하지만 인증서는 직접 연동해야 합니다. 보안 문제로 일부로 제외하였습니다.

## Frontend application

`frontend` 폴더에는 `Next.js`로 생성한 프로젝트 파일들이 있습니다.

-   API Proxy
-   SWR
-   TOAST UI Editor (문서 편집을 위한 자바스크립트 라이브러리)
-   Recoil
-   TailwindCSS
-   Typescript

잘 쓸 수 있는 프론트엔드 프레임워크는 뷰이지만, 일부로 지금까지 전혀 사용해보지 않았던 전혀 모르는 리액트 라이브러리로 구성했습니다.

써드 파티 라이브러리들도 지금까지 전혀 써보지 않았던 것으로 구성하였습니다.

전혀 모르는 분야에서 새로운 것을 배울 수 있을 거라고 생각했습니다.
