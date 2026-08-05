# SYNTRA: API Architecture (Simplified)

**The Setup:** We use **RESTful JSON APIs**. The backend strictly uses **DTOs** (Data Transfer Objects) to communicate with the frontend.

## Quick Q&A for Judges

**Q: How are the APIs secured?**
A: We use JWT (JSON Web Tokens). After logging in, the frontend attaches this token to every request to prove the user's identity.

**Q: Why REST instead of GraphQL?**
A: REST is simple, widely adopted, and perfect for our React Native MVP. We can quickly build and test specific endpoints.

**Q: How do you ensure database changes don't break the frontend?**
A: We use the DTO pattern. The API only sends and receives DTOs, acting as a protective shield between the database and the frontend.

**Q: Is the AI API slow?**
A: External AI calls can be slow, so we built the AI API using Spring WebFlux. This makes it non-blocking, so it doesn't freeze the rest of the backend.

**Q: How do you stop people from spamming the API?**
A: We plan to use an API Gateway to track requests and rate-limit users to prevent abuse or DDoS attacks.
