# SYNTRA: Database Architecture (Simplified)

**The Setup:** We use a **Database-per-Service** architecture with **PostgreSQL**, managed by **Flyway** for migrations.

## Quick Q&A for Judges

**Q: Why PostgreSQL?**
A: Our data (users, goals) is highly relational. Postgres provides strict data integrity (ACID) while still offering JSON support if needed.

**Q: Why a separate database for each service?**
A: It ensures that if one service's database crashes (e.g., Notifications), the rest of the app (like Login and Goals) stays online.

**Q: How do you manage database changes?**
A: We use Flyway. Every change is a version-controlled SQL script, ensuring our database matches our code exactly.

**Q: Why use UUIDs instead of standard IDs (1, 2, 3)?**
A: UUIDs guarantee global uniqueness across our distributed microservices and prevent attackers from guessing other users' IDs.

**Q: What happens to my data if I delete my account?**
A: We use Eventual Consistency. The Auth service deletes you, then tells the Goal and Notification services to wipe your data for privacy compliance.

**Q: How is user data secured?**
A: Passwords are never saved in plain text; they are cryptographically hashed, and our databases are hidden behind private networks.
