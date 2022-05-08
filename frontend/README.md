# Introduction

This project allows you to build a static page for island dashboard using famous library named `react.js` and `Material UI`

# Usage

To start the server on linux system, you have to clone this repository using below command in the linux terminal.

```bash
git clone git@github.com:HarvenDev/island-frontend-react.git
```

and next you have to apply `ssh-id` in this system, on your `Github Account`. you can copy the file content that ends with `*.pub` and paste it on your `Github Account` (`ssh-copy-id`)

```bash
cd ~/.ssh/
```

Note that do not install node_modules manually. In this project, we will be used `Dockerfile` and build the image using `docker build` command or `docker-compose`.
