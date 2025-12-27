# Running Django Migrations in Neon

This guide will help you run Django migrations against your Neon PostgreSQL database.

## Step 1: Get Your Neon Connection String

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Go to the "Connection Details" section
4. Copy your connection string (it looks like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)

## Step 2: Set Environment Variables

You have two options:

### Option A: Create a `.env` file (for local development)

Create a `.env` file in the `portfolio/` directory with:

```env
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=your_host.neon.tech
DB_PORT=5432
```

**OR** if you have a connection string, parse it:
- Connection string format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
- Extract:
  - `DB_USER` = user
  - `DB_PASSWORD` = password
  - `DB_HOST` = host.neon.tech
  - `DB_NAME` = dbname
  - `DB_PORT` = 5432 (default)

### Option B: Export environment variables (for one-time use)

```bash
export DB_NAME=your_database_name
export DB_USER=your_username
export DB_PASSWORD=your_password
export DB_HOST=your_host.neon.tech
export DB_PORT=5432
```

## Step 3: Run Migrations

Once your environment variables are set, run:

```bash
cd portfolio
python manage.py migrate
```

This will create all the necessary tables in your Neon database.

## Step 4: Verify Migrations

Check that migrations were applied:

```bash
python manage.py showmigrations
```

All migrations should show `[X]` indicating they've been applied.

## Step 5: Create a Superuser (Optional)

If you need admin access:

```bash
python manage.py createsuperuser
```

## For Vercel Deployment

When deploying to Vercel, add these environment variables in your Vercel project settings:
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

Vercel will automatically run migrations during deployment if you have a `vercel.json` build command configured.

