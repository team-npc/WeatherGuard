# Weather Safety App

A comprehensive emergency preparedness and family safety application that combines real-time weather monitoring, location tracking, and emergency communication tools.

## 🌟 Features

### Core Functionality
- **Interactive Weather Map**: Real-time weather radar with multiple API fallbacks
- **Location Management**: Save important places and plan live location sharing
- **Emergency Contacts**: Manage family and emergency contact networks
- **Safety Check-ins**: Quick status updates during emergencies
- **Real-time Alerts**: Weather warnings and disaster notifications
- **Emergency Broadcasting**: Automated notifications to emergency contacts

### Technical Highlights
- **API Resilience**: Multiple weather data sources with automatic failover
- **Mobile-First Design**: Optimized for emergency use on mobile devices
- **Privacy Controls**: Granular location sharing permissions
- **Offline Capability**: Critical features work without internet connection
- **Real-time Updates**: WebSocket-based live data synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with geolocation support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-safety-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys (optional for demo)
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   - Navigate to http://localhost:3000
   - Click "Launch Demo" to access the main dashboard
   - Visit http://localhost:3000/meteostat-demo to test Meteostat integration

### Running the Backend API (Optional)

For full functionality with real data:

```bash
# Start the backend server
npm run server:dev

# Or run both frontend and backend
npm run dev:full
```

## 📱 Usage Guide

### Getting Started
1. **Launch the App**: Visit the homepage and click "Launch Demo"
2. **Explore the Map**: Use the interactive map to view weather and location data
3. **Add Locations**: Save important places like home, work, and family locations
4. **Set Up Contacts**: Add emergency contacts and configure sharing permissions
5. **Test Safety Features**: Try the safety check-in system

### Key Features

#### Interactive Map
- **Weather Layers**: Toggle weather radar and traffic overlays
- **Location Markers**: View saved locations and live positions
- **Alert Zones**: See weather warnings and disaster event areas
- **Search**: Find locations using the search bar

#### Location Management
- **Static Locations**: Save and categorize important places
- **Live Sharing**: Plan real-time location sharing with contacts
- **Privacy Controls**: Set granular permissions for each contact
- **Emergency Override**: Automatic location sharing during alerts

#### Safety Check-ins
- **Quick Status**: One-tap "I'm Safe" updates
- **Emergency Alerts**: Send help requests to emergency contacts
- **Location Included**: Optionally share current location
- **Message Details**: Add context to status updates

#### Emergency Alerts
- **Real-time Notifications**: Instant weather and disaster alerts
- **Severity Filtering**: Focus on extreme or severe alerts
- **Browser Notifications**: Alerts even when app is closed
- **Emergency Actions**: Quick access to safety check-ins

## 🏗️ Architecture

### Frontend (Next.js/React)
```
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable React components
│   ├── Map/               # Interactive map components
│   ├── Locations/         # Location management
│   ├── Contacts/          # Contact management
│   └── Safety/            # Emergency and safety features
├── lib/                   # Utilities and services
│   ├── database.ts        # Database connection
│   ├── models/            # Data models and CRUD operations
│   └── services/          # External API integrations
└── types/                 # TypeScript type definitions
```

### Backend (Express.js)
```
server/
├── index.ts              # Main server file
└── routes/               # API route handlers
    ├── users.ts          # User management
    ├── locations.ts      # Location CRUD
    ├── contacts.ts       # Contact management
    ├── safety.ts         # Safety check-ins
    ├── weather.ts        # Weather API integration
    └── disasters.ts      # Disaster event handling
```

### Database (SQLite)
- **Users**: User accounts and preferences
- **Locations**: Static and live location data
- **Contacts**: Emergency contact networks
- **Safety**: Check-ins and emergency events
- **Alerts**: Weather and disaster notifications

## 🔧 Configuration

### Environment Variables

```bash
# Weather API Keys (optional for demo)
OPENWEATHER_API_KEY=your_openweather_api_key
WEATHERAPI_KEY=your_weatherapi_key

# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./weather-safety.db

# External APIs
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
WEATHERAPI_BASE_URL=https://api.weatherapi.com/v1
NWS_BASE_URL=https://api.weather.gov
USGS_EARTHQUAKE_URL=https://earthquake.usgs.gov/fdsnws/event/1
```

### API Keys Setup

1. **OpenWeatherMap** (Primary weather data)
   - Sign up at https://openweathermap.org/api
   - Get free API key (1000 calls/day)
   - Add to `OPENWEATHER_API_KEY`

2. **WeatherAPI** (Backup weather data)
   - Sign up at https://www.weatherapi.com/
   - Get free API key (1M calls/month)
   - Add to `WEATHERAPI_KEY`

3. **RapidAPI** (For Meteostat historical data)
   - Sign up at https://rapidapi.com/
   - Subscribe to Meteostat API
   - Add to `RAPIDAPI_KEY`

4. **National Weather Service** (No key required)
   - Free government API for US weather alerts
   - Automatically used as tertiary fallback

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual Testing Checklist

#### Core Functionality
- [ ] Map loads and displays correctly
- [ ] Location search works
- [ ] Weather data displays
- [ ] Alerts show on map
- [ ] Location management CRUD operations
- [ ] Contact management CRUD operations
- [ ] Safety check-ins submit successfully
- [ ] Emergency alerts display

#### Mobile Responsiveness
- [ ] App works on mobile browsers
- [ ] Touch interactions work properly
- [ ] Text is readable on small screens
- [ ] Buttons are appropriately sized
- [ ] Map controls are accessible

#### Error Handling
- [ ] Graceful degradation when APIs fail
- [ ] Offline functionality works
- [ ] Error messages are user-friendly
- [ ] Network failures are handled

## 📚 API Documentation

### Weather Endpoints
```
GET /api/weather/current?lat={lat}&lng={lng}
GET /api/weather/alerts/active
GET /api/weather/alerts?lat={lat}&lng={lng}&radius={km}
GET /api/weather/meteostat/monthly?lat={lat}&lng={lng}&year={year}&month={month}
```

### Location Endpoints
```
GET /api/locations/static/user/{userId}
POST /api/locations/static
PUT /api/locations/static/{id}
DELETE /api/locations/static/{id}

GET /api/locations/live/user/{userId}/active
POST /api/locations/live
```

### Safety Endpoints
```
GET /api/safety/checkins/user/{userId}
POST /api/safety/checkins
GET /api/safety/notifications/user/{userId}
```

### Contact Endpoints
```
GET /api/contacts/user/{userId}
POST /api/contacts
PUT /api/contacts/{id}
DELETE /api/contacts/{id}
```

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start

# Build backend
npm run build:server
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up API keys
4. Configure CORS for production domain
5. Set up SSL/HTTPS

### Deployment Options
- **Vercel**: Automatic deployment from Git
- **Netlify**: Static site with serverless functions
- **Docker**: Containerized deployment
- **Traditional VPS**: Node.js server deployment

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

**Map not loading**
- Check browser console for errors
- Ensure geolocation permission is granted
- Verify internet connection

**Weather data not updating**
- Check API key configuration
- Verify API rate limits
- Check browser network tab for failed requests

**Location sharing not working**
- Ensure HTTPS (required for geolocation)
- Check browser geolocation permissions
- Verify WebSocket connection

### Getting Help
- Check the GitHub Issues page
- Review the troubleshooting guide
- Contact the development team

## 🔮 Future Enhancements

### Planned Features
- **Mobile App**: React Native implementation
- **Push Notifications**: Real-time emergency alerts
- **Geofencing**: Location-based automatic alerts
- **Advanced Analytics**: Safety pattern analysis
- **Integration APIs**: Third-party emergency services
- **Multi-language Support**: Internationalization

### Technical Improvements
- **Performance**: Optimize map rendering and data loading
- **Accessibility**: Enhanced screen reader support
- **Security**: End-to-end encryption for location data
- **Scalability**: Database optimization and caching
- **Monitoring**: Application performance monitoring

---

Built with ❤️ for emergency preparedness and family safety.
