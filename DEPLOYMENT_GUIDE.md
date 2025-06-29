# Weather Safety App - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Modern web browser
- Internet connection for API data

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd weather-safety-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Follow prompts for domain and environment variables
```

### Option 2: Netlify
```bash
# Build the application
npm run build

# Deploy to Netlify
# Upload the 'out' folder to Netlify dashboard
# Or use Netlify CLI:
npm i -g netlify-cli
netlify deploy --prod --dir=out
```

### Option 3: Docker
```dockerfile
# Dockerfile included in project
docker build -t weather-safety-app .
docker run -p 3000:3000 weather-safety-app
```

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Weather APIs (at least one required)
OPENWEATHER_API_KEY=your_openweather_key
WEATHERAPI_KEY=your_weatherapi_key

# Optional APIs for enhanced features
METEOSTAT_API_KEY=your_meteostat_key

# Database (SQLite by default)
DATABASE_URL=file:./weather_safety.db

# Security
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-domain.com

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
```

### API Key Setup

#### OpenWeatherMap (Primary Weather Source)
1. Visit https://openweathermap.org/api
2. Sign up for free account
3. Get API key from dashboard
4. Add to environment: `OPENWEATHER_API_KEY=your_key`

#### WeatherAPI (Backup Weather Source)
1. Visit https://www.weatherapi.com/
2. Sign up for free account (1M calls/month)
3. Get API key from dashboard
4. Add to environment: `WEATHERAPI_KEY=your_key`

#### Open-Meteo (Free Global Weather)
- No API key required
- Automatic fallback for global coverage
- 10,000 requests/day free tier

## 📊 Database Setup

### SQLite (Default - Development)
```bash
# Database automatically created on first run
# Located at: ./weather_safety.db
# No additional setup required
```

### PostgreSQL (Production)
```bash
# Update DATABASE_URL in environment
DATABASE_URL=postgresql://user:password@host:port/database

# Run migrations
npm run db:migrate
```

### MySQL (Alternative)
```bash
# Update DATABASE_URL in environment
DATABASE_URL=mysql://user:password@host:port/database

# Run migrations
npm run db:migrate
```

## 🔒 Security Configuration

### HTTPS Setup
```nginx
# Nginx configuration for HTTPS
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Content Security Policy
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      connect-src 'self' https://api.openweathermap.org https://api.weatherapi.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

## 📱 PWA Configuration

### Service Worker
```javascript
// Automatically configured for offline functionality
// Caches critical resources for emergency use
// Background sync for emergency data
```

### App Manifest
```json
{
  "name": "Weather Safety App",
  "short_name": "WeatherSafety",
  "description": "Global weather and family safety tracking",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🔍 Monitoring and Analytics

### Error Tracking (Sentry)
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
```javascript
// Built-in Next.js analytics
// Web Vitals tracking
// API response time monitoring
// Error rate tracking
```

### Health Checks
```javascript
// API endpoints for monitoring
GET /api/health - Overall system health
GET /api/weather/health - Weather API status
GET /api/disasters/health - Disaster API status
```

## 🌍 Global Deployment

### CDN Configuration
```javascript
// Cloudflare configuration
// Global edge caching for weather data
// DDoS protection
// SSL termination
```

### Multi-Region Setup
```yaml
# AWS regions for global coverage
regions:
  - us-east-1 (N. Virginia)
  - eu-west-1 (Ireland)
  - ap-southeast-1 (Singapore)
  - ap-northeast-1 (Tokyo)
```

## 🧪 Testing in Production

### Smoke Tests
```bash
# Run after deployment
npm run test:smoke

# Tests critical paths:
# - Homepage loads
# - Weather API responds
# - Location search works
# - Emergency mode activates
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load tests
artillery run load-test.yml
```

### Emergency Scenario Testing
```bash
# Test offline functionality
# Simulate API failures
# Test emergency mode activation
# Verify family notification system
```

## 📈 Scaling Considerations

### Database Scaling
- Read replicas for global coverage
- Connection pooling for high traffic
- Caching layer (Redis) for frequent queries

### API Rate Limiting
- Implement rate limiting per user
- Queue system for high-volume requests
- Circuit breakers for external APIs

### Caching Strategy
- CDN for static assets
- API response caching
- Browser caching for offline functionality

## 🚨 Emergency Procedures

### Incident Response
1. **Monitor alerts** from health check endpoints
2. **Check API status** for external dependencies
3. **Scale resources** if needed for disaster events
4. **Communicate status** to users via status page

### Disaster Recovery
- **Database backups** every 6 hours
- **Code repository** mirrored across regions
- **API failover** automatic with health checks
- **Recovery time objective**: < 15 minutes

### High-Traffic Events
- **Auto-scaling** configured for traffic spikes
- **CDN caching** for static content
- **Database read replicas** for global access
- **Load balancing** across multiple instances

## 📞 Support and Maintenance

### Monitoring Dashboards
- System health and uptime
- API response times and error rates
- User activity and engagement metrics
- Emergency feature usage statistics

### Regular Maintenance
- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and update disaster data sources
- **Annually**: Security audit and penetration testing

### User Support
- In-app help documentation
- Emergency contact information
- Status page for system issues
- Community forum for user questions

## 🎯 Success Metrics

### Technical KPIs
- **Uptime**: > 99.9%
- **Response Time**: < 2 seconds globally
- **Error Rate**: < 0.1%
- **API Success Rate**: > 99%

### User Experience KPIs
- **Emergency Activation**: < 2 taps
- **Global Search**: < 1 second response
- **Family Check-in**: < 10 seconds end-to-end
- **Offline Functionality**: 100% critical features

This deployment guide ensures the Weather Safety App can scale globally while maintaining the reliability families depend on during emergencies.
