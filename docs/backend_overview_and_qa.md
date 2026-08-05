# SYNTRA: Backend Architecture & Judge Q&A Guide

This document outlines the backend ecosystem, framework choices, microservice design, and potential questions judges might ask during a technical review.

## 1. Backend Architecture Overview

SYNTRA uses a **Microservices Architecture** built entirely on the **Spring Boot (Java 17)** ecosystem. The backend is designed to be modular, scalable, and robust.

### Core Technologies
- **Language:** Java 17
- **Framework:** Spring Boot 3.3.0
- **Build Tool:** Maven (`pom.xml`)
- **Security:** Spring Security & JWT (`jjwt`)
- **Data Access:** Spring Data JPA (Hibernate)
- **Containerization:** Docker (`docker-compose.yml`)

### Microservices Breakdown
1. **Auth Service (`auth-service`)**: Handles user registration, login, password hashing, and JWT generation/validation.
2. **Goal Service (`goal-service`)**: The core domain. Manages the CRUD operations for user goals and milestones, and calculates progress.
3. **Notification Service (`notification-service`)**: Manages push notification preferences, delivery logs, and Expo push tokens for the mobile app.
4. **AI Service (`ai-service`)**: Uses Spring WebFlux for reactive, non-blocking communication with external AI providers to generate goal suggestions and motivational messages.

---

## 2. Potential Judge Questions & Suggested Answers

### Q1: Why did you choose Java and Spring Boot for a fast-paced hackathon/project?
**Answer:** "Spring Boot is incredibly robust and opinionated, which actually speeds up development once the boilerplate is set up. With Spring Data JPA and Spring Security, we were able to implement secure, database-backed microservices very quickly. Furthermore, Java 17 offers great performance and features like records, making the code much cleaner."

### Q2: Why did you choose a Microservices architecture over a Monolith?
**Answer:** "We chose microservices to ensure separation of concerns and independent scalability. For example, the `ai-service` might experience high compute load or latency due to external LLM calls, while the `auth-service` needs to be consistently fast and highly available. Microservices allow us to scale the AI service independently without affecting the core login or goal-tracking functionality."

### Q3: The `ai-service` uses Spring WebFlux while the others use standard Spring MVC. Why the difference?
**Answer:** "Standard Spring Web MVC uses a thread-per-request model, which is fine for quick database lookups in our Goal or Auth services. However, the AI service makes network calls to external LLMs, which can take several seconds. If we used standard MVC, those threads would block, quickly exhausting the thread pool under load. WebFlux provides a reactive, non-blocking architecture, allowing the AI service to handle many concurrent requests efficiently."

### Q4: How do these independent microservices communicate with each other?
**Answer:** "Currently, they operate mostly independently, exposing REST APIs to the frontend. For instance, the frontend gets a JWT from the Auth service and passes it directly to the Goal service. For inter-service communication (like telling the Notification service that a new goal was created), we would traditionally use asynchronous messaging via a broker like RabbitMQ or Kafka to maintain loose coupling."

### Q5: How do you handle logging and debugging across four different services?
**Answer:** "In a distributed system, centralized logging is critical. While running locally, we use Docker Compose to orchestrate the containers and view aggregated logs. For a production environment, we would implement the ELK stack (Elasticsearch, Logstash, Kibana) or use distributed tracing tools like Zipkin/Sleuth to track a single request as it bounces between services."

### Q6: I see you have `spring-boot-starter-validation` in your POM files. How is validation handled?
**Answer:** "We validate data at the boundaries. Our DTOs use annotations like `@NotNull`, `@Size`, and `@Email`. The Spring framework intercepts incoming HTTP requests and validates the payload before it even reaches our controller logic. If validation fails, it automatically returns a 400 Bad Request, keeping invalid data out of our database and business logic."

### Q7: Where is your API Gateway or Service Discovery?
**Answer:** "For the current scope, the frontend can be configured to route to specific service ports, or we can use a basic reverse proxy (like NGINX) in Docker Compose. In a more mature deployment, we would introduce Spring Cloud Gateway as a single entry point for the frontend, and Eureka for service discovery, allowing microservices to find each other dynamically without hardcoded IP addresses."
