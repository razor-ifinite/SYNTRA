# Database Migration Guide: Render to Supabase

Since you are early in your project, migrating now is the perfect time! You have two choices:
1. **The Fast Way (Start Fresh):** If you don't care about keeping the test accounts and goals you've created so far, this takes 3 minutes.
2. **The Full Way (Migrate Data):** If you want to keep your existing users and data, you will need to export them first.

---

## Phase 1: Create your Permanent Supabase Database

1. Go to [Supabase.com](https://supabase.com/) and create a free account.
2. Click **"New Project"**.
3. Give it a name (e.g., "SYNTRA-Backend") and generate a **secure database password**. 
   > [!IMPORTANT]
   > Save this password somewhere! You will not be able to see it again.
4. Wait about 2–3 minutes for Supabase to build your new database.
5. Once it's ready, go to the left sidebar and click the ⚙️ **Project Settings** (gear icon) -> **Database**.
6. Scroll down to **Connection String**, select **URI**, and copy the link.
   * *It will look like this: `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres`*
   * *Replace `[YOUR-PASSWORD]` with the password you saved in Step 3.*

---

## Phase 2: Handle Your Data 

### Option A: I don't care about my test data (Skip to Phase 3)
If you are fine with all user accounts and goals being wiped out and starting from a clean slate, you don't need to do anything here! When Spring Boot connects to the new database, it will automatically recreate all your tables for you.

### Option B: I want to keep my data
You will need to copy the data from Render to your computer, and then upload it to Supabase.
1. Open your computer's terminal. (You must have PostgreSQL installed locally for this).
2. Get your Render **External Database URL** from the Render dashboard.
3. Run this command to download your database:
   ```bash
   pg_dump "YOUR_RENDER_EXTERNAL_DB_URL" > syntra_backup.sql
   ```
4. Run this command to upload it to Supabase:
   ```bash
   psql "YOUR_SUPABASE_CONNECTION_STRING" < syntra_backup.sql
   ```

---

## Phase 3: Connect your Backend to Supabase

Now you just need to tell your Render backend services to talk to Supabase instead of the old Render database.

1. Log into your **Render Dashboard**.
2. Click on your first backend service (e.g., `auth-service`).
3. Go to the **Environment** tab on the left.
4. Find the variable named `SPRING_DATASOURCE_URL` (or `DATABASE_URL`).
5. Replace the value with your **Supabase Connection String**.
   > [!NOTE]
   > For Spring Boot (Java), you usually need to change `postgresql://` at the start of the URL to `jdbc:postgresql://`.
   > Example: `jdbc:postgresql://aws-0-region.pooler.supabase.com:6543/postgres?user=postgres.xxx&password=YOUR_PASSWORD`
6. Click **Save Changes**. (Render will automatically redeploy your service).
7. **Repeat steps 2-6** for your other microservices (`goal-service`, `notification-service`, `ai-service`).

Once all your services are green and deployed, open your APK. It is now communicating with your permanent, free Supabase database! You can safely go into Render and delete the old free database instance.
