# SYNTRA: QA & Testing Architecture (Simplified)

**The Setup:** Backend testing uses **JUnit 5 and Mockito**. Frontend testing uses **Jest**.

## Quick Q&A for Judges

**Q: How do you test the backend without a real database?**
A: We use Mockito to fake the database for fast unit tests, or we spin up a temporary, in-memory database for full integration tests.

**Q: Testing AI costs money. How do you test the AI service?**
A: We mock the external AI API calls. This lets us test how our app handles success, timeouts, and errors without actually spending money or waiting for the network.

**Q: How do you test the React Native UI?**
A: We use automated Jest tests for the logic, combined with rigorous manual testing on physical iOS and Android devices via the Expo app to guarantee native feel.

**Q: How do you test your security/logins?**
A: We write automated tests that intentionally send bad or missing JWT tokens to verify that our API correctly rejects unauthorized access.

**Q: How do you handle End-to-End (E2E) testing?**
A: For the MVP, we rely on manual testing of the critical user paths. As we scale, we plan to implement Detox to automate full cross-platform UI tests.
