# Cloudinary Setup Guide

This project uses Cloudinary for image storage in production (Vercel). Cloudinary provides:
- Free tier with 25GB storage and 25GB bandwidth/month
- Automatic image optimization
- CDN delivery
- No file size limits (unlike Vercel's 4.5MB limit)

## Setup Steps

### 1. Create a Cloudinary Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. After signup, you'll be taken to your dashboard

### 2. Get Your Cloudinary Credentials
From your Cloudinary dashboard, you'll see:
- **Cloud Name** (e.g., `your-cloud-name`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Add Environment Variables to Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these three variables:
   - `CLOUDINARY_CLOUD_NAME` = Your cloud name
   - `CLOUDINARY_API_KEY` = Your API key
   - `CLOUDINARY_API_SECRET` = Your API secret

### 4. Redeploy
After adding the environment variables, redeploy your Vercel project. The file uploads will now work!

## How It Works

- **Development**: Files are saved locally to `portfolio/media/`
- **Production (Vercel)**: Files are automatically uploaded to Cloudinary
- **Django Models**: No changes needed - Django automatically uses CloudinaryStorage when configured

## Testing

After setup, try uploading an image through:
- Projects form
- Books form  
- Photos form

The images will be stored in Cloudinary and served via their CDN.

## Troubleshooting

If uploads still fail:
1. Verify all three environment variables are set in Vercel
2. Check that the Cloudinary credentials are correct
3. Ensure you've redeployed after adding the variables
4. Check Vercel function logs for any error messages

