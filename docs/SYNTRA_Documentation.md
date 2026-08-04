# SYNTRA Project Documentation

## 1. Project Overview
**SYNTRA** is a comprehensive goal-tracking application. The system is built with a modern architecture featuring a mobile application frontend and a scalable, microservices-based backend. It aims to help users set, track, and achieve their goals through a streamlined interface with AI integrations.

## 2. Architecture
The project follows a decoupled architecture, utilizing a mobile client communicating with various independent backend microservices via RESTful APIs.

### 2.1 Frontend
The frontend is built using **React Native** and **Expo**, written in **TypeScript**.

- **Key Technologies:** React, React Native, Expo, TypeScript.
- **Core Components:**
  - **AuthScreen:** Handles user login and registration with validation and JWT token management.
  - **GoalScreen:** Main dashboard for viewing, creating, and managing goals.
  - **AiScreen:** A screen to interact with AI-driven insights and features.
- **State Management & API:** Context API (e.g., `AuthContext`) for global state, paired with `fetch` for communicating with the backend microservices.
- **Design System:** Custom UI components utilizing a unified aesthetic with primary branding colors (like `#7C3AED`) and support for light/dark modes.

### 2.2 Backend
The backend is structured as a collection of microservices built with **Java** and **Spring Boot 3**. Each service operates independently and has its own responsibilities.

- **Key Technologies:** Java 17, Spring Boot (Web, Security, Data JPA), PostgreSQL, Flyway, JWT (jjwt), Lombok.
- **Microservices:**
  - `auth-service`: Responsible for user authentication and authorization. It utilizes Spring Security and JWT for secure token-based authentication.
  - `goal-service`: Manages the core business logic related to user goals, including creation, updates, and tracking progress.
  - `ai-service`: Integrates artificial intelligence features, potentially offering insights or recommendations for user goals.
  - `notification-service`: Manages dispatching notifications to users (e.g., reminders for goals).
- **Database:** **PostgreSQL** is the primary relational database, and database schema migrations are managed automatically through **Flyway**.
- **Deployment & Orchestration:** The backend services are containerized and can be orchestrated locally using **Docker Compose**.

## 3. API Contracts (Overview)
- **Authentication:** `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/validate`. All secured endpoints require a valid JWT token passed in the `Authorization: Bearer <token>` header.

## 4. Getting Started (Development)
### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install` (or `yarn`).
3. Run the application: `expo start` (supports iOS, Android, and Web).

### Backend Setup
1. Ensure Docker is running.
2. Navigate to the `backend/` directory.
3. Start the services: `docker-compose up -d`.
4. The services will automatically connect to their respective PostgreSQL databases and run Flyway migrations.
