#!/bin/sh
cd /home/ubuntu/blog-api-server/devops
sudo docker-compose pull api-server
sudo docker-compose up -d api-server

sleep 90

sudo docker-compose pull api-server-green
sudo docker-compose up -d api-server-green

sleep 5
echo "y" | sudo docker image prune -a