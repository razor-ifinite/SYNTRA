# SYNTRA: Frontend Architecture & Judge Q&A Guide

This document outlines the frontend ecosystem, framework choices, and potential questions judges might ask regarding the mobile application layer of SYNTRA.

## 1. Frontend Architecture Overview

SYNTRA's frontend is a cross-platform mobile application built using **React Native** and **Expo**. This allows the team to write a single codebase that deploys natively to both iOS and Android.

### Core Technologies
- **Framework:** React Native (v0.86.2)
- **Toolchain:** Expo (v57) - Provides a managed workflow, fast prototyping, and easy native module integration.
- **Language:** TypeScript - Ensures type safety, reduces runtime errors, and improves developer experience.
- **UI/UX Enhancements:** 
  - `expo-haptics` (for tactile feedback)
  - `@react-native-community/datetimepicker` (for native date/time selection)
  - `@expo/vector-icons` & `react-native-svg` (for crisp, scalable iconography)
- **Local Storage:** `@react-native-async-storage/async-storage` (for persisting JWTs and local preferences).

---

## 2. Potential Judge Questions & Suggested Answers

### Q1: Why did you choose React Native and Expo instead of native Swift/Kotlin or Flutter?
**Answer:** "We chose React Native because it allowed us to leverage our existing JavaScript/React knowledge to build for both iOS and Android simultaneously, which is critical for a fast-paced project. We used **Expo** specifically because its managed workflow handles the complex native build configurations (Xcode/Android Studio), provides over-the-air (OTA) updates, and includes pre-built modules for things like Haptics and Push Notifications out of the box."

### Q2: How are you handling application state? (e.g., Redux, Context API, Zustand)
**Answer:** "For the MVP, we rely on standard React Hooks (`useState`, `useEffect`) and the Context API for global state like user authentication status. Since our backend acts as the single source of truth and our data isn't highly nested, lightweight state management prevents unnecessary boilerplate. If the app scales, we would look into libraries like Zustand or React Query to handle caching and complex state."

### Q3: You are using TypeScript. What is the main benefit for this project?
**Answer:** "TypeScript provides static typing, which drastically reduces runtime errors—like passing a string to a function that expects a Date object. Because our backend uses strict DTOs (Data Transfer Objects), we can define corresponding TypeScript interfaces in the frontend. This ensures the frontend contract perfectly matches the backend contract, making integration seamless and predictable."

### Q4: How do you handle user authentication and session management on the device?
**Answer:** "When a user logs in, the backend returns a JWT (JSON Web Token). We store this token locally using `AsyncStorage`. On subsequent app launches, the app checks `AsyncStorage` for the token to auto-login the user. We attach this token to the `Authorization` header for all backend API requests."

### Q5: Is storing a JWT in `AsyncStorage` secure?
**Answer:** "`AsyncStorage` is unencrypted and behaves like `localStorage` on the web. For an MVP, it is sufficient. However, for a production application handling sensitive data, we would migrate to `expo-secure-store`, which encrypts the token and stores it in the iOS Keychain or Android Keystore to protect against device tampering."

### Q6: How does the application perform if the user loses internet connection?
**Answer:** "Currently, the app relies on the backend for data, meaning offline capabilities are limited. To improve UX in the future, we would implement a caching layer (using React Query or local SQLite). This would allow users to view their cached goals offline, and we could queue up actions (like 'complete milestone') to sync with the backend once the connection is restored."

### Q7: I see you are using `expo-haptics`. Why focus on micro-interactions in a hackathon project?
**Answer:** "User experience is just as important as functionality. Small details, like a subtle haptic vibration when a user checks off a milestone or creates a goal, make the app feel premium, responsive, and deeply integrated with the native hardware. It creates a satisfying feedback loop that encourages users to keep using the app to track their habits."
