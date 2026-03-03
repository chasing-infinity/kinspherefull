# 🚀 KinSphere – Setup Guide
## For Bipolar Factory HR Team

No coding needed. Follow these steps exactly and KinSphere will be live.

---

## What you'll need (all free)
- A computer with internet
- 30 minutes

---

## STEP 1 — Create a GitHub account (5 min)

1. Go to **github.com** and click **Sign up**
2. Create a free account
3. Once logged in, click **New repository** (the green button)
4. Name it: `kinsphere`
5. Set it to **Private**
6. Click **Create repository**

> **What is GitHub?** It's where your code lives, like Google Drive but for software.

---

## STEP 2 — Upload the code (5 min)

1. Download and install **GitHub Desktop**: desktop.github.com
2. Open GitHub Desktop → File → Clone repository → find `kinsphere`
3. It will create a folder on your computer called `kinsphere`
4. **Copy all the files from this zip into that folder** (overwrite everything)
5. Back in GitHub Desktop, you'll see all the files listed
6. Type "Initial upload" in the Summary box at the bottom left
7. Click **Commit to main**
8. Click **Push origin** (top right)

Your code is now on GitHub. ✅

---

## STEP 3 — Create the database (5 min)

1. Go to **railway.app** and click **Start a New Project**
2. Sign in with your GitHub account
3. Click **Add a Service** → **Database** → **PostgreSQL**
4. Wait 30 seconds for it to create
5. Click on the PostgreSQL service
6. Go to the **Connect** tab
7. Copy the string that says **DATABASE_URL** — it looks like:
   `postgresql://postgres:abc123@something.railway.app:5432/railway`
8. **Save this somewhere safe** — you'll need it in the next step

> **What is this?** Railway is hosting your database — where all the employee data is stored.

---

## STEP 4 — Deploy to Vercel (10 min)

1. Go to **vercel.com** → Sign up with GitHub
2. Click **Add New Project**
3. Find your `kinsphere` repository and click **Import**
4. Before clicking Deploy, click **Environment Variables** and add these one by one:

| Name | Value |
|------|-------|
| `DATABASE_URL` | The string you copied from Railway |
| `NEXTAUTH_SECRET` | Go to random.org/strings and generate a 32-character random string |
| `NEXTAUTH_URL` | `https://kinsphere-bipolarfactory.vercel.app` (you'll update this after) |
| `CRON_SECRET` | Any password you make up, e.g. `MySecret2026` |

5. Click **Deploy**
6. Wait 2-3 minutes for it to build (you'll see a progress bar)
7. When it's done, Vercel shows you a URL like `kinsphere-bipolarfactory.vercel.app`
8. Go back to Environment Variables, update `NEXTAUTH_URL` to match that exact URL

---

## STEP 5 — Set up the database (3 min)

After deployment, you need to create the tables. Vercel makes this easy:

1. In your Vercel project, go to **Settings** → **Functions**
2. Open a terminal (on Mac: press Cmd+Space, type Terminal; on Windows: search for Command Prompt)
3. Type these commands one by one, pressing Enter after each:

```
npm install -g vercel
vercel login
vercel env pull .env.local
npx prisma migrate deploy
npm run db:seed
```

> If you're not comfortable with this, ask a developer friend — it takes 2 minutes.

---

## STEP 6 — Log in and you're live! 🎉

Go to your Vercel URL and log in with:

- **Super Admin:** admin@bipolarfactory.com / Admin@123
- **Employee (demo):** priya@bipolarfactory.com / Welcome@123

**First things to do:**
1. Log in as Super Admin
2. Go to **Employees** → **Add Employee** — add your real team
3. Go to **Payroll** → **Salary Configuration** — set up each person's CTC
4. Change the admin password in settings

---

## Payslips — How it works automatically

Once you set up everyone's salary in Payroll → Salary Configuration:

- ✅ On the **15th of every month**, payslips are generated automatically
- ✅ Each employee sees **only their own** payslip when they log in
- ✅ They can view the breakdown (Basic / HRA / Other) and print it

No manual work needed every month. It just happens.

---

## Getting your own domain (optional)

If you want `kinsphere.bipolarfactory.com` instead of the Vercel URL:

1. In Vercel → Project → Settings → Domains
2. Add `kinsphere.bipolarfactory.com`
3. Vercel will show you a DNS record to add
4. Log in to wherever you manage bipolarfactory.com's domain
5. Add that DNS record (takes 10-30 min to activate)

---

## Need help?

If anything goes wrong, the error messages are usually descriptive. Common issues:

- **"Cannot connect to database"** → Double-check your DATABASE_URL in Vercel env vars
- **"Invalid credentials"** → Run `npm run db:seed` again
- **Build failed** → Check the Vercel build logs for the specific error

---

## Default passwords

All new employees added through the system get the default password: **Welcome@123**

They should change it on first login. You can remind them in your onboarding message.

---

*KinSphere — Built for Bipolar Factory*
