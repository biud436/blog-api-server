# 소개

## 구성 방법

You must create a file named `.env` for setting database connection.

```bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=1234
MYSQL_DATABASE=test
MYSQL_USER=admin
MYSQL_PASSWORD=1234
```

and then next you have to run `docker-compose up --build -d` after chaning the password of admin user. if you wish to see tables such as `mysql` and `performance_schema` in the mariadb-server, you connect a database docker container via bash, as follows.

```bash
sudo docker ps -al
# CONTAINER ID   IMAGE            COMMAND                  CREATED          STATUS                         PORTS     NAMES
# 2f22afcec7b0   mariadb:latest   "docker-entrypoint.s…"   40 seconds ago   Restarting (1) 4 seconds ago             mariadb-docker_db_1

sudo docker exec -i -t mariadb-docker_database_1 bash
```

and then you can connect mariadb-server inside the docker container, as follows.

```bash
mysql -u root -p -h localhost
```

and next try to do below sql command.

```sql
grant all privileges on *.* to 'admin'@'%';
flush privileges;
```
