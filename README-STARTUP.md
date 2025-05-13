# SEMS Application Startup Guide

## Prerequisites
- Docker and Docker Compose
- Java 17
- Maven
- Python 3.8+ (for Integration Service)
- Node.js 18+ and npm (for Frontend)

## Quick Start

### 1. Start Infrastructure & Backend Services
```bash
# Make scripts executable
chmod +x start-sems.sh stop-sems.sh init-databases.sh

# Start all backend services
./start-sems.sh
```

### 2. Start Frontend
```bash
cd frontend/sems-ui
npm install  # Only first time
npm start
```

## Access Points
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080/api
- Eureka Dashboard: http://localhost:8761
- Grafana: http://localhost:3000/grafana (admin/admin)

## Stopping Everything
```bash
./stop-sems.sh
```

## Troubleshooting
- If services fail to start, check console output for errors
- For database issues: `./init-databases.sh`
- For Kafka topics: `docker exec -it $(docker ps -q -f name=kafka) kafka-topics --list --bootstrap-server localhost:9092` 