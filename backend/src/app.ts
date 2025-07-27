import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/logger';
import eventRoutes from './routes/events';
import { initializeDatabase, getDatabase } from './config/database';
import { OpenAIVisionService } from './services/OpenAIVisionService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:3004',
    'http://127.0.0.1:3005',
    'http://127.0.0.1:3006',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger); // Custom logger for development
  app.use(morgan('dev')); // Additional morgan logging
} else {
  app.use(morgan('combined')); // Standard logging for production
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'EventSync API',
  });
});

// Debug endpoint (temporary)
app.get('/debug', (_req, res) => {
  res.status(200).json({
    apiKeyLength: process.env.AI_MODEL_API_KEY ? process.env.AI_MODEL_API_KEY.length : 0,
    apiKeyStartsWith: process.env.AI_MODEL_API_KEY ? process.env.AI_MODEL_API_KEY.substring(0, 10) + '...' : 'undefined',
    isDemoKey: process.env.AI_MODEL_API_KEY === 'sk-demo-key-for-testing',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Test OpenAI endpoint (temporary)
app.get('/test-openai', async (_req, res) => {
  try {
    // Test simple OpenAI call
    const openai = new (await import('openai')).default({
      apiKey: process.env.AI_MODEL_API_KEY,
    });
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say 'Hello World'" }],
      max_tokens: 10,
    });
    
    res.status(200).json({
      success: true,
      response: response.choices[0]?.message?.content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Test OpenAI Vision endpoint (temporary)
app.get('/test-openai-vision', async (_req, res) => {
  try {
    const openai = new (await import('openai')).default({
      apiKey: process.env.AI_MODEL_API_KEY,
    });
    
    // Test with a simple image URL
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What do you see in this image? Just say 'I can see an image' if you can see it."
            },
            {
              type: "image_url",
              image_url: {
                url: "https://picsum.photos/200/200"
              }
            }
          ]
        }
      ],
      max_tokens: 50,
    });
    
    res.status(200).json({
      success: true,
      response: response.choices[0]?.message?.content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Debug endpoint para probar OpenAI Vision
app.get('/debug-vision', async (_req, res) => {
  try {
    const visionService = OpenAIVisionService.getInstance();
    
    // Crear una imagen de prueba
    const testImageUrl = 'https://picsum.photos/800/600?random=999';
    const response = await fetch(testImageUrl);
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // Probar Vision AI directamente
    const result = await visionService.extractEventFromUrl('https://www.instagram.com/p/debug-test/');
    
    res.json({
      success: true,
      result,
      imageSize: imageBuffer.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/events', eventRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Seed some sample data for testing
const seedSampleData = async () => {
  try {
    const db = getDatabase();
    
    // Check if we already have events
    const existing = db.prepare('SELECT COUNT(*) as count FROM events').get();
    
    if (existing && (existing as any).count === 0) {
      console.log('🌱 Seeding sample events...');
      
      const sampleEvents = [
        {
          title: 'Concierto de Jazz en Barcelona',
          description: 'Una noche increíble con los mejores músicos de jazz de la ciudad',
          date: '2024-03-20',
          time: '21:00',
          location: 'Palau de la Música Catalana, Barcelona',
          instagram_url: 'https://www.instagram.com/p/sample1/',
          raw_content: 'Concierto de Jazz - 20 de Marzo - 21:00h - Palau de la Música',
          extracted_data: JSON.stringify({ confidence: 0.9, type: 'concert' })
        },
        {
          title: 'Festival de Arte Digital',
          description: 'Exposición interactiva de arte digital y nuevas tecnologías',
          date: '2024-03-25',
          time: '18:00',
          location: 'CCCB, Barcelona',
          instagram_url: 'https://www.instagram.com/p/sample2/',
          raw_content: 'Festival Arte Digital - 25 Marzo - CCCB Barcelona',
          extracted_data: JSON.stringify({ confidence: 0.8, type: 'exhibition' })
        },
        {
          title: 'Taller de Cocina Mediterránea',
          description: 'Aprende a cocinar auténticos platos mediterráneos con chef profesional',
          date: '2024-03-22',
          time: '16:00',
          location: 'Escuela de Cocina Barcelona',
          instagram_url: 'https://www.instagram.com/p/sample3/',
          raw_content: 'Taller Cocina Mediterránea - Sábado 22 - 16h',
          extracted_data: JSON.stringify({ confidence: 0.75, type: 'workshop' })
        },
        {
          title: 'Exposición de Fotografía Urbana',
          description: 'Muestra de los mejores fotógrafos urbanos de Barcelona',
          date: '2024-04-01',
          time: '19:00',
          location: 'Centre de Cultura Contemporània de Barcelona',
          instagram_url: 'https://www.instagram.com/p/sample4/',
          raw_content: 'Exposición Fotografía Urbana - 1 Abril - CCCB',
          extracted_data: JSON.stringify({ confidence: 0.85, type: 'exhibition' })
        }
      ];
      
      for (const event of sampleEvents) {
        db.prepare(`
          INSERT INTO events (title, description, date, time, location, instagram_url, raw_content, extracted_data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run([
          event.title,
          event.description,
          event.date,
          event.time,
          event.location,
          event.instagram_url,
          event.raw_content,
          event.extracted_data
        ]);
      }
      
      console.log(`✅ Seeded ${sampleEvents.length} sample events`);
    } else {
      console.log(`📊 Database already has ${(existing as any)?.count || 0} events`);
    }
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
};

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    await seedSampleData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 