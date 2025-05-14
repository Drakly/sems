#!/bin/bash

# Set colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starting SEMS Application ===${NC}"

# Step 1: Start infrastructure services with Docker Compose
echo -e "${YELLOW}Starting infrastructure services with Docker...${NC}"
docker-compose up -d mysql mongodb elasticsearch redis zookeeper kafka prometheus grafana

# Initialize databases and create Kafka topics
echo -e "${YELLOW}Initializing databases and Kafka topics...${NC}"
./init-databases.sh

# Step 2: Start discovery and config server
echo -e "${YELLOW}Starting Discovery Server...${NC}"
cd discovery-server
mvn spring-boot:run -Dspring-boot.run.profiles=local &
DISCOVERY_PID=$!
cd ..

echo -e "${YELLOW}Waiting for Discovery Server to start...${NC}"
while ! curl -s http://localhost:8761/actuator/health | grep -q "UP"; do
  echo -e "${YELLOW}Discovery Server not ready yet, waiting...${NC}"
  sleep 5
done
echo -e "${GREEN}Discovery Server is running.${NC}"

echo -e "${YELLOW}Starting Config Server...${NC}"
cd config-server
mvn spring-boot:run -Dspring-boot.run.profiles=composite &
CONFIG_PID=$!
cd ..

echo -e "${YELLOW}Waiting for Config Server to start...${NC}"
while ! curl -s http://localhost:8888/actuator/health | grep -q "UP"; do
  echo -e "${YELLOW}Config Server not ready yet, waiting...${NC}"
  sleep 5
done
echo -e "${GREEN}Config Server is running.${NC}"

# Step 3: Start core services
echo -e "${YELLOW}Starting User Service...${NC}"
cd user-service
mvn spring-boot:run -Dspring-boot.run.profiles=local &
USER_PID=$!
cd ..

echo -e "${YELLOW}Starting Expense Service...${NC}"
cd expense-service
mvn spring-boot:run -Dspring-boot.run.profiles=local &
EXPENSE_PID=$!
cd ..

echo -e "${YELLOW}Starting Document Service...${NC}"
cd document-service
mvn spring-boot:run -Dspring-boot.run.profiles=local &
DOCUMENT_PID=$!
cd ..

echo -e "${YELLOW}Starting Notification Service...${NC}"
cd notification-service
mvn spring-boot:run -Dspring-boot.run.profiles=local &
NOTIFICATION_PID=$!
cd ..

echo -e "${YELLOW}Starting Reporting Service...${NC}"
cd reporting-service
mvn spring-boot:run -Dspring-boot.run.profiles=local &
REPORTING_PID=$!
cd ..

echo -e "${YELLOW}Starting Integration Service...${NC}"
cd integration-service
python -m app.main &
INTEGRATION_PID=$!
cd ..

# Step 4: Finally, start the gateway
echo -e "${YELLOW}Waiting for services to be registered...${NC}"
sleep 20

echo -e "${YELLOW}Starting Gateway Service...${NC}"
cd gateway-service
mvn spring-boot:run -Dspring-boot.run.profiles=local &
GATEWAY_PID=$!
cd ..

echo -e "${GREEN}=== All services started ===${NC}"
echo -e "${GREEN}=== SEMS Application is running ===${NC}"
echo -e "${YELLOW}To stop the application, run: ./stop-sems.sh${NC}"

# Save PIDs to file for the stop script
echo "DISCOVERY_PID=$DISCOVERY_PID" > .sems-pids
echo "CONFIG_PID=$CONFIG_PID" >> .sems-pids
echo "USER_PID=$USER_PID" >> .sems-pids
echo "EXPENSE_PID=$EXPENSE_PID" >> .sems-pids
echo "DOCUMENT_PID=$DOCUMENT_PID" >> .sems-pids
echo "NOTIFICATION_PID=$NOTIFICATION_PID" >> .sems-pids
echo "REPORTING_PID=$REPORTING_PID" >> .sems-pids
echo "INTEGRATION_PID=$INTEGRATION_PID" >> .sems-pids
echo "GATEWAY_PID=$GATEWAY_PID" >> .sems-pids

echo -e "${GREEN}Access the application at: http://localhost:8080${NC}"
echo -e "${GREEN}Access Eureka at: http://localhost:8761${NC}"
echo -e "${GREEN}Access Grafana at: http://localhost:3000 (admin/admin)${NC}"

# Keep script running
wait 