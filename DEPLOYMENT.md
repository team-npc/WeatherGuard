# Deployment Guide

This guide covers deploying the Weather Safety App to various platforms and environments.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment for Next.js applications with automatic builds and deployments.

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy!

3. **Environment Variables**
   Add these in Vercel dashboard under Settings > Environment Variables:
   ```
   OPENWEATHER_API_KEY=your_openweather_api_key
   WEATHERAPI_KEY=your_weatherapi_key
   NODE_ENV=production
   ```

### Option 2: Netlify

1. **Build Configuration**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

2. **Deploy**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables

### Option 3: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci --only=production
   
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t weather-safety-app .
   docker run -p 3000:3000 weather-safety-app
   ```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Weather API Keys (at least one recommended)
OPENWEATHER_API_KEY=your_openweather_api_key_here
WEATHERAPI_KEY=your_weatherapi_key_here

# Application Settings
NODE_ENV=production
PORT=3000

# Database (for full backend functionality)
DATABASE_PATH=./weather-safety.db

# API Configuration
API_TIMEOUT=10000
MAX_RETRIES=3

# CORS Settings
CORS_ORIGIN=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Optional Environment Variables

```bash
# External API URLs (can override defaults)
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
WEATHERAPI_BASE_URL=https://api.weatherapi.com/v1
NWS_BASE_URL=https://api.weather.gov
USGS_EARTHQUAKE_URL=https://earthquake.usgs.gov/fdsnws/event/1

# Notification Services (future implementation)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_email@example.com

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## 🏗️ Production Build

### Frontend Only (Static Export)

For static hosting without server-side features:

1. **Configure Next.js for Static Export**
   ```javascript
   // next.config.js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   }
   
   module.exports = nextConfig
   ```

2. **Build and Export**
   ```bash
   npm run build
   # Creates 'out' directory with static files
   ```

### Full Stack Deployment

For complete functionality with backend API:

1. **Build Application**
   ```bash
   npm run build
   npm run build:server
   ```

2. **Start Production Server**
   ```bash
   npm start
   npm run server
   ```

## 🔒 Security Considerations

### HTTPS Requirements

- **Geolocation API**: Requires HTTPS in production
- **Service Workers**: Require HTTPS for offline functionality
- **Push Notifications**: Require HTTPS

### API Key Security

1. **Environment Variables**: Never commit API keys to version control
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **CORS Configuration**: Restrict origins in production
4. **Input Validation**: Validate all user inputs

### Database Security

1. **Connection Security**: Use encrypted connections
2. **Access Control**: Implement proper user authentication
3. **Data Encryption**: Encrypt sensitive location data
4. **Backup Strategy**: Regular automated backups

## 📊 Monitoring and Analytics

### Application Monitoring

1. **Error Tracking**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Performance Monitoring**
   - Core Web Vitals tracking
   - API response time monitoring
   - Database query performance

3. **Uptime Monitoring**
   - Health check endpoints
   - External monitoring services
   - Alert notifications

### Analytics Setup

1. **Google Analytics 4**
   ```javascript
   // Add to _app.tsx
   import { GoogleAnalytics } from '@next/third-parties/google'
   
   export default function App({ Component, pageProps }) {
     return (
       <>
         <Component {...pageProps} />
         <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
       </>
     )
   }
   ```

2. **Custom Event Tracking**
   - Safety check-in events
   - Emergency alert interactions
   - Location sharing usage

## 🚨 Emergency Preparedness

### High Availability Setup

1. **Load Balancing**: Multiple server instances
2. **Database Replication**: Master-slave configuration
3. **CDN Integration**: Global content delivery
4. **Failover Strategy**: Automatic failover procedures

### Disaster Recovery

1. **Backup Strategy**
   - Daily database backups
   - Code repository backups
   - Configuration backups

2. **Recovery Procedures**
   - Documented recovery steps
   - Regular recovery testing
   - Emergency contact procedures

## 🔧 Maintenance

### Regular Updates

1. **Dependency Updates**
   ```bash
   npm audit
   npm update
   ```

2. **Security Patches**
   - Monitor security advisories
   - Apply critical patches immediately
   - Test updates in staging environment

3. **Performance Optimization**
   - Regular performance audits
   - Database optimization
   - Cache strategy updates

### Monitoring Checklist

- [ ] Application uptime
- [ ] API response times
- [ ] Database performance
- [ ] Error rates
- [ ] Security alerts
- [ ] SSL certificate expiration
- [ ] Domain renewal
- [ ] Backup verification

## 📱 Mobile Considerations

### Progressive Web App (PWA)

The app includes PWA features for mobile optimization:

1. **Service Worker**: Offline functionality
2. **Web App Manifest**: Install prompts
3. **Push Notifications**: Emergency alerts

### Mobile-Specific Deployment

1. **App Store Deployment** (Future)
   - React Native version
   - iOS App Store guidelines
   - Google Play Store requirements

2. **Mobile Web Optimization**
   - Touch-friendly interface
   - Responsive design
   - Fast loading times

## 🌍 Global Deployment

### Multi-Region Setup

1. **Geographic Distribution**
   - Multiple server regions
   - Regional API endpoints
   - Localized weather data

2. **Internationalization**
   - Multi-language support
   - Regional weather services
   - Local emergency protocols

### Compliance

1. **Data Privacy**
   - GDPR compliance (EU)
   - CCPA compliance (California)
   - Regional privacy laws

2. **Emergency Services**
   - Local emergency number integration
   - Regional alert systems
   - Government API compliance

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Runtime Errors**
   - Check environment variables
   - Verify API key configuration
   - Review server logs

3. **Performance Issues**
   - Monitor API rate limits
   - Check database connection
   - Review network latency

### Support Resources

- **Documentation**: Comprehensive guides and API references
- **Community**: GitHub discussions and issue tracking
- **Professional Support**: Enterprise support options

---

For additional deployment assistance, please refer to the main README.md or contact the development team.
