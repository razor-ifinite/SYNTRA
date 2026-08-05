# SYNTRA: Frontend Architecture (Simplified)

**The Setup:** A cross-platform mobile app built with **React Native**, managed by **Expo**, and written in **TypeScript**.

## Quick Q&A for Judges

**Q: Why React Native and Expo?**
A: React Native lets us write one codebase for both iOS and Android. Expo handles all the complex native builds and provides easy modules for haptics and notifications.

**Q: Why did you use TypeScript?**
A: TypeScript catches bugs as we type. It also lets us perfectly match our frontend data models to the backend's API, preventing integration errors.

**Q: How are you managing the app's state?**
A: We use lightweight React Hooks and Context API for the MVP. It keeps the codebase simple and fast without the heavy boilerplate of Redux.

**Q: How does the app remember who is logged in?**
A: We securely save the user's JWT to local device storage (`AsyncStorage`). The app automatically attaches it to API calls on startup.

**Q: Does the app work offline?**
A: Offline support is currently limited. In our next iteration, we will use local caching (like React Query or SQLite) so users can view their goals without internet.
