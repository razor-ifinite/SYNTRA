# SYNTRA: API Architecture & Judge Q&A Guide

This document outlines the API design principles, endpoints structure, and potential questions judges might ask regarding the API layer of SYNTRA.

## 1. API Architecture Overview

SYNTRA's backend services communicate with the frontend (and potentially each other) via **RESTful APIs** using standard HTTP methods and JSON payloads.

- **Protocol:** HTTP/HTTPS
- **Architecture Style:** REST (Representational State Transfer)
- **Data Format:** JSON
- **Contract Enforcement:** Uses Data Transfer Objects (DTOs) heavily to ensure that the internal database entities are never exposed directly to the client.

### Standardized Endpoints
Each microservice exposes a base path under `/api/`, for example:
- **Auth API:** `/api/auth/register`, `/api/auth/login`
- **Goal API:** `/api/goals`, `/api/goals/user/{userId}`
- **AI API:** `/api/ai/suggest`, `/api/ai/motivate`
- **Notification API:** `/api/notifications`

### HTTP Methods Used
- `POST`: Used for creating resources (e.g., creating a new goal, requesting an AI suggestion).
- `GET`: Used for retrieving resources (e.g., fetching a user's goals or progress).
- `PATCH`: Used for partial updates (e.g., updating a goal's status to COMPLETED).
- `DELETE`: Used for removing resources or cascading deletes for GDPR compliance (e.g., deleting a user and their history).

---

## 2. Potential Judge Questions & Suggested Answers

### Q1: How do you secure your API endpoints?
**Answer:** "We use JSON Web Tokens (JWT) for authentication. When a user logs in via the Auth API, they receive a JWT. For all subsequent requests to the Goal, AI, or Notification APIs, the frontend must attach this JWT in the `Authorization: Bearer <token>` header. The backend services validate this token before processing the request, ensuring the user is authorized."

### Q2: Why did you choose REST instead of GraphQL or gRPC?
**Answer:** "For this MVP, REST was chosen for its simplicity, wide adoption, and ease of integration with our React Native frontend. While GraphQL could reduce over-fetching, our endpoints are currently tailored to specific views, minimizing wasted data. We would consider gRPC for internal microservice-to-microservice communication in the future for lower latency."

### Q3: How do you ensure that changes to your database schema don't break the frontend API contract?
**Answer:** "We strictly use the **DTO (Data Transfer Object) Pattern**. Our Controllers only accept and return DTOs (like `GoalRequest` or `GoalResponse`), not the actual JPA entity classes mapping to the database. This acts as a buffer—if our database schema changes, we only update the Entity-to-DTO mapper, leaving the API contract completely unchanged for the frontend."

### Q4: How does the AI API work? Is it slow?
**Answer:** "The AI API (`/api/ai/suggest`) handles external calls to LLMs (like OpenAI). Because these calls can have high latency, we used Spring WebFlux to make the AI service asynchronous and non-blocking. This ensures that a slow AI response doesn't tie up backend threads and crash the service under heavy load."

### Q5: How do you plan to handle API versioning if you release a V2 of the app?
**Answer:** "Right now, we use a standard `/api/` prefix. If we need breaking changes in the future, we would introduce URL versioning, such as `/api/v1/goals` and `/api/v2/goals`. This allows older versions of the mobile app to continue functioning until users update."

### Q6: What happens when I request to delete my account?
**Answer:** "We expose specific `/user/{userId}` DELETE endpoints across our services (like `AiController.deleteAllAiHistoryByUser` and `GoalController.deleteAllGoalsByUser`). When an account deletion is triggered, these endpoints ensure that all related user data across the distributed microservices is purged, adhering to data privacy standards."

### Q7: How do you handle API rate limiting to prevent abuse?
**Answer:** "While not fully implemented in the hackathon MVP, the standard approach in our architecture would be to place an API Gateway (like Spring Cloud Gateway or NGINX) in front of these microservices. The Gateway would track requests per IP or User ID and throttle them (e.g., max 100 requests per minute) to protect our backend services from DDoS attacks or runaway frontend loops."
