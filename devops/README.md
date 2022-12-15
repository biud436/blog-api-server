# Introduction

Note that the certificate file for ssl is not included in this repository for security reason. To create some ssl file, I've recommended to use AWS Certificate Manager and Route 53. In case of this project, I've created a certificate file using certbot image after creating a one docker network that is included the nginx container and volumes.

## Installation

In this command works fine in docker and docker-compose is installed on your computer. open the terminal and run the following command:

```sh
docker-compose up --build -d
```

I've tested in this project in Mac OS and Ubuntu 20.04
