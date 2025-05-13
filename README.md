# Smart Expense Management System (SEMS)

A microservices-based Expense Management System that allows companies to track, analyze, and manage their expenses, including invoice document management, real-time notifications, and reporting features.

## Architecture

This project follows a microservices architecture with:

- Hexagonal Architecture + Domain-Driven Design
- API Gateway: Spring Cloud Gateway
- Service Discovery: Netflix Eureka
- Centralized Configuration: Spring Cloud Config Server
- Event-Driven Communication: Apache Kafka
- Storage: MySQL for relational data, MongoDB for documents
- Monitoring & Logging: Prometheus, Grafana

## Technology Stack

- **Backend:** Java 17, Spring Boot 3.x
- **Frontend:** React 18 with TypeScript, Material-UI
- **Relational Database:** MySQL 8.0
- **Document DB:** MongoDB
- **Key-Value Store:** Redis
- **Messaging Platform:** Apache Kafka
- **Containerization:** Docker
- **Observability:** Prometheus, Grafana

## Project Modules

- **Gateway Service:** API Gateway, routing requests to microservices
- **User Service:** User registration, authentication (JWT), roles & permissions
- **Expense Service:** CRUD operations for expenses, budget management, approval workflows
- **Document Service:** File uploads, document management
- **Notification Service:** Consumes expense events, sends notifications
- **Discovery Server:** Service registry for microservices (Eureka)
- **Config Server:** Centralized externalized configuration management

## Frontend Application

- React-based SPA with TypeScript
- Material-UI for responsive design
- Redux for state management
- Authentication with JWT
- Dashboard with expense metrics and visualizations

## Detailed Installation Guide

### Prerequisites

- Java 17+ (OpenJDK or Oracle JDK)
- Node.js 16+ and npm 8+
- Docker and Docker Compose (v2.x recommended)
- Maven 3.8+
- Git

### System Requirements

- **Minimum:** 8GB RAM, 4 CPU cores, 20GB free disk space
- **Recommended:** 16GB RAM, 8 CPU cores, 40GB free disk space

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/sems.git
cd sems
```

### Step 2: Installation Options

SEMS can be deployed in three different ways depending on your needs:

#### Option 1: Infrastructure Services in Docker, Microservices Local (Development Mode)

This hybrid approach is recommended for development, allowing you to debug microservices locally.

1. **Start the Infrastructure Services:**

```bash
docker-compose -f docker-compose-infra.yml up -d
```

This will start the following services:
- MySQL (port 3307)
- MongoDB (port 27017)
- Redis (port 6379)
- Elasticsearch (ports 9200, 9300)
- Kafka & Zookeeper (ports 9092, 2181)
- Prometheus (port 9090)
- Grafana (port 3000)

2. **Create the Required MySQL Databases:**

```bash
docker exec -it sems-mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS sems_users;"
docker exec -it sems-mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS sems_expenses;"
docker exec -it sems-mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS sems_reporting;"
```

3. **Start the Microservices in Order:**

```bash
# Start config server first
cd config-server
./mvnw spring-boot:run
# In a new terminal window
cd discovery-server
./mvnw spring-boot:run
# In a new terminal window
cd gateway-service
./mvnw spring-boot:run
# In a new terminal window
cd user-service
./mvnw spring-boot:run
# In a new terminal window
cd expense-service
./mvnw spring-boot:run
# In a new terminal window
cd notification-service
./mvnw spring-boot:run
# In a new terminal window
cd document-service
./mvnw spring-boot:run
# In a new terminal window
cd reporting-service
./mvnw spring-boot:run
# In a new terminal window
cd integration-service
./mvnw spring-boot:run
```

4. **Start the Frontend Application:**

```bash
cd frontend/sems-ui
npm install
npm start
```

#### Option 2: Full Docker Deployment (Production/Staging Mode)

This approach runs everything in Docker containers, ideal for production or staging environments.

1. **Build and Start All Services:**

```bash
docker-compose build
docker-compose up -d
```

This will start all infrastructure services and microservices in Docker containers. The frontend will be available at http://localhost:3000.

2. **Monitor the Startup Process:**

```bash
docker-compose logs -f
```

You can also check the status of all services:

```bash
docker-compose ps
```

#### Option 3: Docker Swarm or Kubernetes Deployment (Production)

For production environments with higher availability requirements, we provide configurations for orchestrated deployments:

**Docker Swarm:**
```bash
docker swarm init
docker stack deploy -c docker-stack.yml sems
```

**Kubernetes:**
```bash
kubectl apply -f kubernetes/
```

### Step 3: Accessing the Application

After successful startup:

- **Frontend UI:** http://localhost:3000
- **API Gateway:** http://localhost:8080
- **Eureka Dashboard:** http://localhost:8761
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000 (admin/admin)

### Step 4: Configure Databases (First-time Setup)

The application will automatically create tables on first run, but you can also initialize the databases with sample data:

```bash
# For local development (Option 1)
cd scripts
./init-databases.sh

# For Docker deployment (Option 2)
docker exec -it sems-mysql mysql -uroot -proot < scripts/init-databases.sql
```

## Environment Configuration

### Application Properties

Application configuration is managed through Spring Cloud Config Server, with files located in the `config-repo` directory:

- `application.yml`: Common settings for all services
- `<service-name>.yml`: Service-specific configurations

### Docker Environment Variables

For Docker deployments, you can customize environment variables in the `docker-compose.yml` file or by creating a `.env` file in the project root.

Common variables you might want to customize:
- `MYSQL_ROOT_PASSWORD`: Root password for MySQL (default: root)
- `MYSQL_USER`: MySQL user (default: sems)
- `MYSQL_PASSWORD`: MySQL password (default: sems)
- `MONGODB_USER`: MongoDB user (default: sems)
- `MONGODB_PASSWORD`: MongoDB password (default: sems)

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   
   If you have port conflicts, you can modify the port mappings in the `docker-compose.yml` file.

2. **Database Connection Issues**
   
   Ensure the MySQL databases are created and accessible. Check connection strings in the config files.

3. **Microservices Not Registering with Eureka**
   
   Verify that Eureka is running and accessible. Check the network settings if running in Docker.

4. **Frontend API Connection Issues**
   
   Ensure the gateway service is running and the frontend's API base URL is configured correctly.

### Logs

For Docker deployments, you can view logs with:
```bash
docker-compose logs -f [service_name]
```

For local services, logs are available in the terminal or in the `logs` directory of each service.

## Service Endpoints

- Config Server: http://localhost:8888
- Discovery Server: http://localhost:8761
- API Gateway: http://localhost:8080
- User Service: http://localhost:8081/users
- Expense Service: http://localhost:8082/expenses
- Notification Service: http://localhost:8083/notifications
- Document Service: http://localhost:8084/documents
- Reporting Service: http://localhost:8085/reports
- Integration Service: http://localhost:8000/api

## API Documentation

Swagger UI is available for each service:
- Gateway: http://localhost:8080/swagger-ui.html
- User Service: http://localhost:8081/users/swagger-ui.html
- Expense Service: http://localhost:8082/expenses/swagger-ui.html
- Document Service: http://localhost:8084/documents/swagger-ui.html
- Reporting Service: http://localhost:8085/reports/swagger-ui.html

## Current Development Status

- Infrastructure setup complete with Docker
- Core services implemented (config, discovery, gateway, user, expense)
- Data models and repositories implemented
- Basic authentication working
- Frontend connected to backend services
- Mock data implemented for development 

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 