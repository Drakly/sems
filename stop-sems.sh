#!/bin/bash

# Set colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Stopping SEMS Application ===${NC}"

# Load PIDs from file
if [ -f .sems-pids ]; then
  source .sems-pids
else
  echo -e "${RED}No PID file found! Unable to stop services gracefully.${NC}"
  echo -e "${YELLOW}Attempting to stop Docker services anyway...${NC}"
fi

# Stop services in reverse order
echo -e "${YELLOW}Stopping Gateway Service...${NC}"
if [ ! -z "$GATEWAY_PID" ] && ps -p $GATEWAY_PID > /dev/null; then
  kill $GATEWAY_PID
  sleep 2
fi

echo -e "${YELLOW}Stopping Integration Service...${NC}"
if [ ! -z "$INTEGRATION_PID" ] && ps -p $INTEGRATION_PID > /dev/null; then
  kill $INTEGRATION_PID
  sleep 2
fi

echo -e "${YELLOW}Stopping Reporting Service...${NC}"
if [ ! -z "$REPORTING_PID" ] && ps -p $REPORTING_PID > /dev/null; then
  kill $REPORTING_PID
  sleep 2
fi

echo -e "${YELLOW}Stopping Notification Service...${NC}"
if [ ! -z "$NOTIFICATION_PID" ] && ps -p $NOTIFICATION_PID > /dev/null; then
  kill $NOTIFICATION_PID
  sleep 2
fi

echo -e "${YELLOW}Stopping Document Service...${NC}"
if [ ! -z "$DOCUMENT_PID" ] && ps -p $DOCUMENT_PID > /dev/null; then
  kill $DOCUMENT_PID
  sleep 2
fi

echo -e "${YELLOW}Stopping Expense Service...${NC}"
if [ ! -z "$EXPENSE_PID" ] && ps -p $EXPENSE_PID > /dev/null; then
  kill $EXPENSE_PID
  sleep 2
fi

echo -e "${YELLOW}Stopping User Service...${NC}"
if [ ! -z "$USER_PID" ] && ps -p $USER_PID > /dev/null; then
  kill $USER_PID
  sleep 2
fi

echo -e "${YELLOW}Stopping Config Server...${NC}"
if [ ! -z "$CONFIG_PID" ] && ps -p $CONFIG_PID > /dev/null; then
  kill $CONFIG_PID
  sleep 2
fi

echo -e "${YELLOW}Stopping Discovery Server...${NC}"
if [ ! -z "$DISCOVERY_PID" ] && ps -p $DISCOVERY_PID > /dev/null; then
  kill $DISCOVERY_PID
  sleep 2
fi

# Stop Docker containers
echo -e "${YELLOW}Stopping infrastructure services with Docker...${NC}"
docker-compose stop

# Cleanup pid file
rm -f .sems-pids

echo -e "${GREEN}=== SEMS Application stopped ===${NC}" 