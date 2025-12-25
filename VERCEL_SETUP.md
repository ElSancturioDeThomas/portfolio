# Vercel Deployment Setup

This Django portfolio project is configured for deployment on Vercel.

## Required Environment Variables

Set these in your Vercel project settings (Dashboard → Settings → Environment Variables):

1. **SECRET_KEY**: Django secret key
   - Value: `nscrai0j2*@24c9(r!281cs-t9wurn0)zyu-a#y35+0wcdr_1b`
   - ⚠️ **Important**: Never commit this to git! Only set it in Vercel environment variables.

2. **DEBUG**: Set to `False` for production
   - Value: `False`

3. **ALLOWED_HOSTS**: Your Vercel domain (optional, already includes .vercel.app)
   - Value: `your-project.vercel.app` (if you have a custom domain)

## Database Considerations

⚠️ **Important**: SQLite (the default database) does NOT work well on Vercel's serverless functions because:
- Each function invocation is stateless
- SQLite requires file system persistence
- Vercel functions are read-only except for `/tmp`

### Recommended Solutions:

1. **Use PostgreSQL with External Providers** (Recommended):
   - **Supabase** (free tier available, easy setup)
     - Sign up at supabase.com
     - Create a new project
     - Get connection string from Settings → Database
   - **Neon** (serverless Postgres, free tier)
     - Sign up at neon.tech
     - Create a project and get connection string
   - **Railway** (PostgreSQL, simple setup)
     - Sign up at railway.app
     - Create PostgreSQL service
   - **PlanetScale** (MySQL, serverless)
   - **Render** (PostgreSQL, free tier)

2. **Update your `settings.py`** to use PostgreSQL:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': os.environ.get('DB_NAME'),
           'USER': os.environ.get('DB_USER'),
           'PASSWORD': os.environ.get('DB_PASSWORD'),
           'HOST': os.environ.get('DB_HOST'),
           'PORT': os.environ.get('DB_PORT', '5432'),
       }
   }
   ```

3. **Add to `requirements.txt`**:
   ```
   psycopg2-binary==2.9.9
   ```

4. **Set Database Environment Variables in Vercel**:
   - `DB_NAME`: Database name
   - `DB_USER`: Database user
   - `DB_PASSWORD`: Database password
   - `DB_HOST`: Database host (from provider)
   - `DB_PORT`: Database port (usually 5432)

## Deployment Steps

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: Vercel will automatically detect `vercel.json` and deploy

## Files Created for Vercel

- `vercel.json`: Vercel configuration (uses Django's WSGI directly)
- `.vercelignore`: Files to exclude from deployment
- Updated `settings.py`: Environment variable support and Vercel domain whitelist

## Static Files

Static files are served from the `/static/` directory. Make sure to run `python manage.py collectstatic` locally before deploying, or configure Vercel to run it during build.

## Notes

- The project uses Django's WSGI application wrapped in a Vercel serverless function
- All routes are handled by the Django application
- Static files are routed separately for better performance

