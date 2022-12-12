#!/bin/sh
cd /home/ubuntu/blog-api-server/devops
sudo docker-compose pull api-server
sudo docker-compose pull api-server-green
sudo docker-compose up -d