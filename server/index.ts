import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDatabase } from '../src/lib/database';
import { seedDatabase } from '../src/lib/seed';

// Import route handlers
import userRoutes from './routes/users';
import locationRoutes from './routes/locations';
import contactRoutes from './routes/contacts';
import safetyRoutes from './routes/safety';
import weatherRoutes from './routes/weather';
import disasterRoutes from './routes/disasters';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Weather Safety API'
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/disasters', disasterRoutes);

// Database initialization and seeding endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    await getDatabase(); // This will initialize the database
    const result = await seedDatabase();
    res.json({
      success: true,
      message: 'Database initialized and seeded successfully',
      data: result
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database on startup
    await getDatabase();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Weather Safety API server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Initialize DB: POST http://localhost:${PORT}/api/init-db`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Graceful shutdown...');
  process.exit(0);
});

startServer();
