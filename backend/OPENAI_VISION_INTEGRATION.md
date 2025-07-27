# OpenAI Vision Integration for EventSync

## Overview

This document describes the integration of OpenAI Vision AI for extracting event information from Instagram posts. The system replaces the previous mock service with real AI-powered event extraction capabilities.

## Architecture

### Services

1. **OpenAIVisionService** - Main service for AI-powered event extraction
2. **InstagramScraperService** - Handles Instagram data extraction and image downloading
3. **EventExtractionService** - Orchestrates the extraction process

### Flow

```
Instagram URL → InstagramScraperService → OpenAIVisionService → EventExtractionService → Extracted Event Data
```

## Features

### 1. OpenAI Vision AI Integration
- **Model**: GPT-4 Vision Preview
- **Capabilities**: 
  - Image analysis and text extraction
  - Event information parsing
  - Multi-language support (Spanish/English)
  - Structured data extraction

### 2. Optimized Prompts
The system includes specialized prompts for different event types:

- **Conciertos y Música** - Music events, concerts, festivals
- **Gastronomía y Restaurantes** - Food events, restaurants, cooking classes
- **Arte y Cultura** - Art exhibitions, museums, cultural events
- **Tecnología y Conferencias** - Tech conferences, workshops, summits
- **Deportes y Fitness** - Sports events, fitness activities
- **Fiestas y Eventos Sociales** - Parties, celebrations, social events
- **Evento Genérico** - Generic event extraction

### 3. Fallback Mechanisms
- **Primary**: OpenAI Vision AI
- **Secondary**: OCR (Tesseract.js) for text extraction
- **Tertiary**: Basic fallback with limited information

### 4. Rate Limiting & Error Handling
- **Rate Limiting**: 1 second minimum between requests
- **Retry Logic**: 3 retries with exponential backoff
- **Error Recovery**: Graceful degradation through fallback methods
- **Queue Management**: Request queuing for rate limit compliance

### 5. Performance Monitoring
- **Metrics**: Processing time, success rate, confidence scores
- **Logging**: Detailed logs for debugging and monitoring
- **Statistics**: Service performance tracking

## Configuration

### Environment Variables

```bash
# OpenAI Configuration
AI_MODEL_ENDPOINT=https://api.openai.com/v1
AI_MODEL_API_KEY=your-openai-api-key
AI_MODEL_NAME=gpt-4-vision-preview
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.1
AI_TIMEOUT=30000
```

### Dependencies

```json
{
  "openai": "^4.0.0",
  "tesseract.js": "^4.0.0",
  "node-fetch": "^2.6.0",
  "@types/node-fetch": "^2.6.0"
}
```

## Usage

### Basic Event Extraction

```typescript
import { EventExtractionService } from './services/EventExtractionService';

const extractionService = EventExtractionService.getInstance();
const result = await extractionService.extractEventFromUrl('https://instagram.com/p/example');

if (result.success) {
  console.log('Extracted Event:', result.data);
  console.log('Confidence:', result.confidence);
  console.log('Processing Time:', result.processingTime);
} else {
  console.error('Extraction failed:', result.error);
}
```

### Service Statistics

```typescript
const stats = extractionService.getStats();
console.log('Service Statistics:', stats);
```

## API Endpoints

### Extract Event from Instagram URL

```
POST /api/events/extract
Content-Type: application/json

{
  "url": "https://instagram.com/p/example"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Event Title",
    "description": "Event Description",
    "date": "2024-03-15",
    "time": "20:00",
    "location": "Event Location",
    "confidence": 0.85,
    "metadata": {
      "extractionMethod": "vision",
      "processingTime": 2500,
      "warnings": []
    }
  }
}
```

## Error Handling

### Common Error Types

1. **Rate Limit Exceeded**
   - Error: "Rate limit exceeded, please try again later"
   - Solution: Implement exponential backoff

2. **Content Not Accessible**
   - Error: "Instagram content not accessible or private"
   - Solution: Verify URL accessibility

3. **Image Processing Failed**
   - Error: "Failed to download image from Instagram"
   - Solution: Check network connectivity and Instagram availability

4. **AI Model Error**
   - Error: "Vision AI processing failed"
   - Solution: Check OpenAI API key and quota

### Fallback Strategy

1. **Primary**: OpenAI Vision AI (highest accuracy)
2. **Secondary**: OCR text extraction (medium accuracy)
3. **Tertiary**: Basic extraction (lowest accuracy)

## Performance Considerations

### Processing Times
- **Vision AI**: 2-4 seconds
- **OCR Fallback**: 3-6 seconds
- **Basic Fallback**: 1-2 seconds

### Rate Limits
- **OpenAI API**: 10 requests per minute (default)
- **Instagram Scraping**: 2 seconds between requests
- **Service Queue**: Automatic rate limiting

### Memory Usage
- **Image Buffer**: ~1-5MB per image
- **OCR Processing**: ~50-100MB peak
- **AI Model**: ~200-500MB per request

## Security

### API Key Management
- Store OpenAI API key in environment variables
- Never commit API keys to version control
- Use different keys for development and production

### Data Privacy
- Images are processed in memory only
- No persistent storage of Instagram content
- Temporary buffers are cleared after processing

## Monitoring & Logging

### Log Levels
- **INFO**: Service initialization, successful extractions
- **WARN**: Fallback method usage, rate limiting
- **ERROR**: Failed extractions, API errors

### Metrics
- Total extractions
- Success rate
- Average processing time
- Method distribution (vision/ocr/fallback)

## Troubleshooting

### Common Issues

1. **OpenAI API Key Invalid**
   ```
   Error: OpenAI API key not found in environment variables
   Solution: Set AI_MODEL_API_KEY environment variable
   ```

2. **Rate Limit Exceeded**
   ```
   Error: Rate limit exceeded
   Solution: Implement request queuing and backoff
   ```

3. **Image Download Failed**
   ```
   Error: Failed to download image
   Solution: Check Instagram URL accessibility
   ```

4. **OCR Processing Failed**
   ```
   Error: OCR could not extract meaningful text
   Solution: Image may be too low quality or contain no text
   ```

## Future Enhancements

### Planned Features
1. **Multi-language Support**: Additional language prompts
2. **Advanced OCR**: Better text recognition for complex layouts
3. **Image Preprocessing**: Enhance image quality before processing
4. **Caching**: Cache processed results for repeated URLs
5. **Batch Processing**: Process multiple URLs simultaneously

### Performance Optimizations
1. **Image Compression**: Reduce memory usage
2. **Parallel Processing**: Process multiple requests concurrently
3. **Smart Caching**: Cache frequently accessed content
4. **Load Balancing**: Distribute requests across multiple API keys

## Contributing

### Development Setup
1. Install dependencies: `npm install`
2. Set environment variables
3. Run tests: `npm test`
4. Start development server: `npm run dev`

### Code Style
- Follow TypeScript best practices
- Use meaningful variable names
- Add comprehensive error handling
- Include JSDoc comments for public methods

## License

This integration is part of the EventSync project and follows the same licensing terms. 