# SYNTRA: Database Architecture & Judge Q&A Guide

This document provides a comprehensive overview of SYNTRA's database architecture, schema details for each microservice, and a curated list of potential questions judges might ask during a pitch or technical review, along with suggested answers.

## 1. Database Architecture Overview

SYNTRA uses a **Microservices Architecture** with a **Database-per-Service** pattern. This means that each microservice manages its own domain data, promoting loose coupling and independent scalability. 

- **Primary Database Engine:** PostgreSQL (Relational Database)
- **Migration Tool:** Flyway (for version-controlled database schemas)
- **Object-Relational Mapping (ORM):** Spring Data JPA (Hibernate under the hood)

### Why this architecture?
- **Decoupling:** Services can be developed, deployed, and scaled independently.
- **Resilience:** A database failure in one service (e.g., notifications) doesn't completely bring down the authentication or goal-tracking systems.
- **Maintainability:** Schema changes are localized to the specific service via Flyway scripts (`V1__...`, `V2__...`), preventing unintended side effects across the system.

---

## 2. Schema Details by Service

The database schemas are defined using Flyway SQL migrations.

### **Auth Service (`auth-service`)**
Manages user identities, credentials, and authentication.

- **Table: `users`**
  - `id` (UUID, Primary Key) - Auto-generated using `gen_random_uuid()`
  - `name` (VARCHAR)
  - `email` (VARCHAR, Unique)
  - `password_hash` (VARCHAR) - Stored securely; plain text passwords are never saved.
  - `created_at` (TIMESTAMP)

### **Goal Service (`goal-service`)**
Handles the core business logic of tracking user goals and milestones.

- **Table: `goals`**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID) - References the user, but not as a hard foreign key to the `users` table since they are in different services.
  - `title` (VARCHAR)
  - `description` (TEXT)
  - `deadline` (TIMESTAMP)
  - `status` (VARCHAR) - Default: `ACTIVE`
  - `created_at` (TIMESTAMP)

- **Table: `milestones`**
  - `id` (UUID, Primary Key)
  - `goal_id` (UUID, Foreign Key to `goals.id` with `ON DELETE CASCADE`)
  - `title` (VARCHAR)
  - `due_date` (TIMESTAMP)
  - `status` (VARCHAR) - Default: `PENDING`
  - `created_at` (TIMESTAMP)

### **Notification Service (`notification-service`)**
Manages push notifications, user preferences, and notification history.

- **Table: `notifications`** (In-app notifications)
  - `id` (UUID, PK), `user_id` (UUID), `title`, `message`, `type` (Default: `INFO`), `is_read` (BOOLEAN), `created_at`
- **Table: `notification_configs`** (User preferences for goal reminders)
  - `id` (UUID, PK), `user_id` (UUID), `goal_id` (UUID), `frequency`, `time_of_day`, `message`, `created_at`
- **Table: `notification_logs`** (Audit trail of sent notifications)
  - `id` (UUID, PK), `user_id` (UUID), `goal_id` (UUID), `message`, `sent_at`, `status`
- **Table: `push_tokens`** (Expo push tokens for mobile delivery)
  - `user_id` (UUID, PK), `expo_push_token`, `updated_at`

### **AI Service (`ai-service`)**
- Does not currently persist its own relational data. It acts as a stateless service that processes data from other services or external APIs using Spring WebFlux.

---

## 3. Potential Judge Questions & Suggested Answers

When presenting your technical stack, judges often look for justification of your architectural choices, understanding of trade-offs, and how you handle edge cases.

### Q1: Why did you choose PostgreSQL over a NoSQL database like MongoDB?
**Answer:** "We chose PostgreSQL because SYNTRA's core data—users, goals, and milestones—is highly relational and structured. PostgreSQL provides strong ACID compliance, ensuring data integrity. It also supports JSONB if we ever need unstructured data flexibility (e.g., for complex AI responses) without sacrificing the benefits of a robust relational schema."

### Q2: You are using a Microservices architecture. How do you handle data relationships across different services? (e.g., tying a user to their goals)
**Answer:** "Because each service has its own database context, we use **UUIDs** as the primary identifiers. For instance, the `goals` table stores a `user_id`, but it is not a strict database-level Foreign Key constraint tied to the `auth-service` database. Instead, the application layer (or API Gateway) orchestrates this relationship, allowing our services to remain loosely coupled."

### Q3: How do you handle database migrations as your schema evolves?
**Answer:** "We use **Flyway** for database migrations. Every schema change is written as a versioned SQL script (e.g., `V1__create_users.sql`). This ensures that our database schema is version-controlled right alongside our application code, making deployments predictable and preventing manual schema-mismatch errors across environments."

### Q4: Why are you using UUIDs instead of standard auto-incrementing integers for your primary keys?
**Answer:** "UUIDs are crucial for a distributed microservices environment. They guarantee global uniqueness without requiring a centralized database sequence. Additionally, using UUIDs prevents enumeration attacks (where a malicious user could guess user ID `5` if they are user `4`) and hides the scale/size of our user base."

### Q5: If I delete my account, what happens to my goals and notifications? (Data Consistency)
**Answer:** "In a microservices architecture, this is handled via **Eventual Consistency**. When the Auth Service deletes a user, it would ideally publish a `UserDeleted` event to a message broker (like Kafka or RabbitMQ). The Goal Service and Notification Service would listen to this event and asynchronously clean up the associated goals and notification configs to comply with data privacy (GDPR/CCPA)." *(Note: If you haven't implemented message brokers yet, you can mention that for the MVP, you either do synchronous API calls or that it is on the roadmap for V2).*

### Q6: How are you securing sensitive user data?
**Answer:** "Security is handled at multiple levels. In the database, we never store plain-text passwords; we store a `password_hash` (likely using bcrypt via Spring Security). Additionally, our database would ideally be deployed in a private subnet, inaccessible from the public internet, with only the microservices allowed to connect via secured credentials."

### Q7: Your notification service has four different tables. Why is it so complex?
**Answer:** "We separated concerns for scalability. 
- `notification_configs` stores *when* and *how often* a user wants to be reminded about a goal.
- `push_tokens` stores their mobile device identifier (Expo token).
- `notifications` acts as the user's in-app inbox.
- `notification_logs` acts as an audit trail for our background workers. 
This separation allows our notification cron jobs to quickly scan `notification_configs` and fire off messages without getting bogged down by the massive read/write volume of the in-app `notifications` inbox."

### Q8: What if one of your microservices databases goes down?
**Answer:** "Because of the database-per-service pattern, the failure is isolated. If the Notification Service DB crashes, users might not get reminders, but they can still log in (Auth Service) and view/edit their goals (Goal Service). This provides graceful degradation rather than a total system outage."
