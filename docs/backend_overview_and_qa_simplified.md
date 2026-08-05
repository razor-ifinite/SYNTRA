# SYNTRA: Backend Architecture (Simplified)

**The Setup:** A modular **Microservices** backend built with **Java 17** and **Spring Boot 3**. Services include Auth, Goal, Notification, and AI.

## Quick Q&A for Judges

**Q: Why Java and Spring Boot?**
A: Spring Boot is incredibly robust and secure out-of-the-box. It allowed us to quickly spin up secure APIs and connect to our databases fast.

**Q: Why Microservices instead of a Monolith?**
A: It lets us scale parts of the app independently. If the AI service gets overloaded, we can scale it up without touching the Auth or Goal services.

**Q: Why does the AI service use a different framework (WebFlux)?**
A: AI requests take a long time to process. WebFlux is "reactive," meaning it can handle thousands of waiting AI requests without crashing the server.

**Q: How do the microservices talk to each other?**
A: Right now they expose standard REST APIs. In the future, they will use a message broker (like RabbitMQ) to pass background events seamlessly.

**Q: How do you prevent bad data from crashing the app?**
A: We use Spring Validation. If an email is formatted wrong or a title is missing, the backend instantly rejects it with a 400 Error before it ever reaches our logic.
