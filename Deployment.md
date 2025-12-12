# BlockWitness Backend Deployment Guide for Render

## Prerequisites
- GitHub account
- Render account (free tier works)
- Your code pushed to a GitHub repository

## Files Created
1. **Dockerfile** - Container configuration for backend
2. **.dockerignore** - Files to exclude from Docker build
3. **render.yaml** - Render service configuration (optional)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push files to GitHub**
   ```bash
   git add Dockerfile .dockerignore render.yaml
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create:
     - Web service (backend API)
     - PostgreSQL database

3. **Wait for deployment**
   - Render will build the Docker image
   - Deploy the service
   - You'll get a URL like: `https://blockwitness-backend.onrender.com`

### Option 2: Manual Setup

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `blockwitness-db`
   - Region: Oregon (or your preferred region)
   - Plan: Free
   - Click "Create Database"
   - Copy the "Internal Database URL"

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `blockwitness-backend`
     - **Region**: Same as database
     - **Branch**: `main`
     - **Root Directory**: Leave empty (or `.` if needed)
     - **Environment**: `Docker`
     - **Dockerfile Path**: `./Dockerfile`
     - **Plan**: Free

3. **Add Environment Variables**
   - In the web service settings, add:
     - `DATABASE_URL`: Paste the Internal Database URL from step 1
     - `PORT`: `5000` (Render will override this automatically)

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

## Post-Deployment

### Update Frontend API URL

After deployment, update your frontend's API URL:

1. Open `frontend/src/api.js`
2. Change:
   ```javascript
   const API_BASE = "https://your-backend-url.onrender.com/api";
   ```

### Test Your Backend

Visit these endpoints to verify:
- `https://your-backend-url.onrender.com/` - Should return status message
- `https://your-backend-url.onrender.com/db-test` - Should confirm database connection
- `https://your-backend-url.onrender.com/api/explorer` - Should return empty array initially

## Important Notes

### Free Tier Limitations
- **Spin down after inactivity**: Free tier services sleep after 15 minutes of inactivity
- **First request**: Takes 30-50 seconds to wake up
- **Database**: 90 days of inactivity before deletion
- **Storage**: Files in `uploads/` and `certificates/` are ephemeral (lost on restart)

### Storage Solution
For persistent file storage, consider:
1. **Cloudinary** - Image storage
2. **AWS S3** - General file storage
3. **Render Disks** - Paid persistent storage

### Database Migration
Your app uses SQLAlchemy with PostgreSQL (as configured in `backend/app.py`):
- Tables are created automatically on startup
- No SQLite on Render (uses PostgreSQL)

## Troubleshooting

### Build Fails
- Check Render build logs for errors
- Verify all dependencies in `requirements.txt`
- Ensure Python version matches (3.12.16)

### Database Connection Issues
- Verify `DATABASE_URL` environment variable is set
- Check that database is in same region as web service
- Ensure `psycopg2-binary` is in requirements.txt

### Application Errors
- Check Render logs: Dashboard → Your Service → Logs
- Look for Python stack traces
- Verify all required directories are created

### First Request Takes Long
- This is normal for free tier (spin-up time)
- Consider upgrading to paid tier for always-on service
- Or use a service like UptimeRobot to ping every 14 minutes

## Scaling Options

When ready to scale:
1. Upgrade to Starter plan ($7/month) for always-on service
2. Add more workers in Dockerfile:
   ```dockerfile
   CMD gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 backend.app:app
   ```
3. Enable autoscaling in Render settings

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | Auto-set | Port for the application |
| `PYTHON_VERSION` | No | Python version (3.12.16) |

## Useful Commands

**View logs:**
```bash
# In Render Dashboard → Your Service → Logs
```

**Redeploy:**
```bash
# Push to GitHub triggers auto-deploy
git push origin main
```

**Manual deploy:**
```bash
# In Render Dashboard → Your Service → Manual Deploy → Deploy latest commit
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Update CORS settings in `backend/app.py` for production domains
3. **Keys**: Ensure `issuer_priv.pem` and `issuer_pub.pem` are in repository
4. **Database**: Use Render's PostgreSQL internal URL for security

## Next Steps

1. Deploy backend to Render
2. Update frontend API URL
3. Deploy frontend to Vercel/Netlify/Render static site
4. Test end-to-end functionality
5. Monitor logs and performance

## Support

- [Render Documentation](https://render.com/docs)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/latest/deploying/)
- [PostgreSQL on Render](https://render.com/docs/databases)