#!/bin/bash

# Set colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Initializing SEMS Databases ===${NC}"

# Wait for MySQL to be ready
echo -e "${YELLOW}Waiting for MySQL to be ready...${NC}"
MYSQL_CONTAINER=$(docker ps -q -f name=mysql)
if [ -z "$MYSQL_CONTAINER" ]; then
  echo -e "${RED}MySQL container not found! Is Docker running?${NC}"
  exit 1
fi

until docker exec $MYSQL_CONTAINER mysql -uroot -proot -e "SELECT 1" >/dev/null 2>&1; do
  echo -e "${YELLOW}MySQL not ready yet, waiting...${NC}"
  sleep 3
done

echo -e "${GREEN}MySQL is ready. Creating databases...${NC}"

# Create MySQL databases
docker exec $MYSQL_CONTAINER mysql -uroot -proot -e "
CREATE DATABASE IF NOT EXISTS sems_users;
CREATE DATABASE IF NOT EXISTS sems_expenses;
CREATE DATABASE IF NOT EXISTS sems_notification;
CREATE DATABASE IF NOT EXISTS sems_reporting;
CREATE DATABASE IF NOT EXISTS sems_document;
GRANT ALL PRIVILEGES ON sems_users.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON sems_expenses.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON sems_notification.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON sems_reporting.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON sems_document.* TO 'root'@'%';
FLUSH PRIVILEGES;
"

echo -e "${GREEN}MySQL databases created.${NC}"

# Wait for MongoDB to be ready
echo -e "${YELLOW}Waiting for MongoDB to be ready...${NC}"
MONGO_CONTAINER=$(docker ps -q -f name=mongodb)
if [ -z "$MONGO_CONTAINER" ]; then
  echo -e "${RED}MongoDB container not found! Is Docker running?${NC}"
  exit 1
fi

until docker exec $MONGO_CONTAINER mongosh --eval "db" --quiet >/dev/null 2>&1; do
  echo -e "${YELLOW}MongoDB not ready yet, waiting...${NC}"
  sleep 3
done

echo -e "${GREEN}MongoDB is ready.${NC}"

# Create MongoDB databases - MongoDB creates databases when first accessed
echo -e "${GREEN}MongoDB will create databases automatically when services connect.${NC}"

# Create Kafka topics
echo -e "${YELLOW}Creating Kafka topics...${NC}"
KAFKA_CONTAINER=$(docker ps -q -f name=kafka)
if [ -z "$KAFKA_CONTAINER" ]; then
  echo -e "${RED}Kafka container not found! Is Docker running?${NC}"
  exit 1
fi

until docker exec $KAFKA_CONTAINER kafka-topics --list --bootstrap-server localhost:9092 >/dev/null 2>&1; do
  echo -e "${YELLOW}Kafka not ready yet, waiting...${NC}"
  sleep 3
done

echo -e "${GREEN}Kafka is ready. Creating topics...${NC}"

docker exec $KAFKA_CONTAINER kafka-topics --create --if-not-exists --topic expense-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec $KAFKA_CONTAINER kafka-topics --create --if-not-exists --topic user-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec $KAFKA_CONTAINER kafka-topics --create --if-not-exists --topic document-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec $KAFKA_CONTAINER kafka-topics --create --if-not-exists --topic integration-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

echo -e "${GREEN}Kafka topics created:${NC}"
docker exec $KAFKA_CONTAINER kafka-topics --list --bootstrap-server localhost:9092

echo -e "${GREEN}=== Database initialization complete ===${NC}" 