# SYNTRA: QA & Testing Architecture & Judge Q&A Guide

This document outlines the testing strategies, frameworks, and methodologies used across the SYNTRA stack, along with potential questions judges or QA specialists might ask during a technical review.

## 1. QA & Testing Architecture Overview

SYNTRA approaches quality assurance at multiple levels to ensure that both the backend microservices and the React Native frontend are robust and reliable. 

### Backend Testing (Java / Spring Boot)
The backend uses standard Java testing frameworks to validate business logic and API endpoints:
- **Unit Testing:** JUnit 5 is used to test individual methods and classes in isolation.
- **Mocking:** Mockito is utilized heavily in the Service layer to mock out Database calls (Repositories) and external API calls (like the AI LLM).
- **Integration Testing:** `@SpringBootTest` and `MockMvc` are used to test the full request-response lifecycle of the Controllers without necessarily booting up a real PostgreSQL database (often using an in-memory H2 database for testing or Testcontainers).
- **Security Testing:** `spring-security-test` is used to ensure that endpoints properly reject unauthorized requests (e.g., requests missing a valid JWT).

### Frontend Testing (React Native / Expo)
- **Frameworks:** Jest is the standard test runner for React Native Expo applications.
- **Component Testing:** React Native Testing Library (RNTL) is typically used to render components in memory and assert that UI elements exist and behave correctly when interacted with.
- **Manual QA:** Extensive manual testing is performed using the Expo Go app on both iOS and Android physical devices to ensure native modules (like haptics and date pickers) function flawlessly.

---

## 2. Potential Judge Questions & Suggested Answers

### Q1: How do you ensure your microservices are tested thoroughly without setting up a massive local environment?
**Answer:** "We rely heavily on unit tests with Mockito to test our business logic in isolation—for example, mocking the database repository in `GoalServiceTest`. For integration tests, we use `@SpringBootTest` combined with `MockMvc` to simulate HTTP requests. If we need a real database for integration tests, we can use Testcontainers to spin up a disposable PostgreSQL Docker container for the duration of the test."

### Q2: Did you write tests for your AI service? Since it relies on an external API, how do you test it reliably?
**Answer:** "Yes, testing external services can be tricky because we don't want our automated tests making real network calls (which cost money and are slow). We use Mockito to mock the WebClient or external API service layer. This allows us to simulate a successful LLM response, a timeout, or a 500 error, ensuring our backend handles these edge cases gracefully."

### Q3: How do you test the frontend UI components across different platforms (iOS vs Android)?
**Answer:** "For automated testing, we use Jest to ensure our pure JavaScript/TypeScript logic works. For UI components, React Native Testing Library allows us to interact with the DOM-like structure. However, because we use native modules like `expo-haptics` and native DatePickers, automated UI tests can only go so far. We supplement them with rigorous manual QA on actual iOS and Android devices via Expo to verify the true native feel and layout."

### Q4: How do you handle End-to-End (E2E) testing?
**Answer:** "For a hackathon/MVP phase, we primarily rely on manual E2E testing to ensure the critical paths (like creating a user, adding a goal, and receiving a notification) work seamlessly. As the project scales, we would implement Detox or Appium to automate these cross-platform E2E flows, ensuring that the frontend correctly talks to the deployed backend microservices."

### Q5: How do you test your JWT authentication flow?
**Answer:** "On the backend, we use `spring-security-test`. We write tests that intentionally omit the `Authorization` header, or pass an expired/invalid token, and assert that the API returns a `401 Unauthorized`. We also write tests that inject a mocked, authenticated user context into the SecurityContextHolder to test secured endpoints."

### Q6: I see you have a Notification Service. How do you QA test push notifications without spamming real devices?
**Answer:** "During automated testing, the service that actually dispatches the notification to Expo's push servers is mocked. We verify that the method was called with the correct Expo push token and message payload. For manual QA, we use Expo's Push Notification Tool website with our specific device tokens to verify that the notifications are received and rendered correctly on our physical test devices."

### Q7: What is your strategy for testing data migrations?
**Answer:** "Because we use Flyway, our schema changes are versioned. We test migrations by starting with an empty database (or a snapshot of the current production schema) and letting Flyway run all migration scripts sequentially on startup. If a SQL syntax error exists in `V2__create_milestones.sql`, the Spring Boot application will fail to start during our CI/CD pipeline, catching the error before it reaches production."
