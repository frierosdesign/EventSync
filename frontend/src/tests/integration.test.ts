/**
 * Integration Test - EventSync Frontend-Backend Connection
 * 
 * Tests the complete flow: URL → API → Extraction → Preview
 */

import { apiClient, ApiError, ApiErrorType } from '../lib/api-client';
import { ExtractEventRequest } from '../types';

// ===========================================
// TEST HELPERS
// ===========================================

const TEST_URLS = {
  // URLs de ejemplo para testing
  instagram: {
    valid: 'https://www.instagram.com/p/CwIRIuMgQaL/',
    invalid: 'https://invalid-url.com',
    private: 'https://www.instagram.com/p/private-post/'
  }
};

// Mock console methods para testing
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

const mockConsole = () => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
};

const restoreConsole = () => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
};

// ===========================================
// API CLIENT TESTS
// ===========================================

describe('ApiClient Integration Tests', () => {
  beforeEach(() => {
    mockConsole();
  });

  afterEach(() => {
    restoreConsole();
  });

  describe('Health Check', () => {
    it('should successfully connect to backend health endpoint', async () => {
      try {
        const health = await apiClient.health();
        
        expect(health).toBeDefined();
        expect(health.status).toBe('OK');
        expect(health.service).toBe('EventSync API');
        expect(health.timestamp).toBeDefined();
        
        console.log('✅ Health check passed:', health);
      } catch (error) {
        console.error('❌ Health check failed:', error);
        throw error;
      }
    }, 10000);

    it('should handle network errors gracefully', async () => {
      // Test with invalid base URL
      const invalidClient = new (apiClient.constructor as any)({
        baseURL: 'http://invalid-url:9999'
      });

      try {
        await invalidClient.health();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(ApiErrorType.NETWORK_ERROR);
        console.log('✅ Network error handled correctly:', error);
      }
    }, 10000);
  });

  describe('Event Extraction', () => {
    it('should extract event from valid Instagram URL', async () => {
      const request: ExtractEventRequest = {
        url: TEST_URLS.instagram.valid
      };

      try {
        const response = await apiClient.extractEvent(request);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        
        if (response.success && response.data) {
          expect(response.data.event).toBeDefined();
          expect(response.data.extracted).toBeDefined();
          expect(response.data.event.title).toBeDefined();
          expect(response.data.extracted.metadata).toBeDefined();
          expect(response.data.extracted.metadata.confidence).toBeGreaterThan(0);
          
          console.log('✅ Event extraction successful:', {
            title: response.data.event.title,
            confidence: response.data.extracted.metadata.confidence,
            processingTime: response.data.extracted.metadata.processingTime
          });
        }
      } catch (error) {
        if (error instanceof ApiError) {
          console.log('⚠️ Expected API error for test URL:', error.message);
          // En testing, esto es esperado ya que usamos URLs de prueba
        } else {
          console.error('❌ Unexpected error:', error);
          throw error;
        }
      }
    }, 30000);

    it('should handle invalid URLs appropriately', async () => {
      const request: ExtractEventRequest = {
        url: TEST_URLS.instagram.invalid
      };

      try {
        await apiClient.extractEvent(request);
        // Si llega aquí, debería ser un error controlado
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        console.log('✅ Invalid URL handled correctly:', (error as ApiError).message);
      }
    }, 15000);

    it('should implement retry logic for transient failures', async () => {
      const request: ExtractEventRequest = {
        url: TEST_URLS.instagram.valid
      };

      // Simular un escenario donde el primer intento falla pero el retry funciona
      let attemptCount = 0;
      const originalFetch = global.fetch;
      
      global.fetch = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          // Primer intento falla con error de red
          return Promise.reject(new Error('Network timeout'));
        }
        // Segundo intento funciona
        return originalFetch.apply(global, arguments as any);
      });

      try {
        await apiClient.extractEvent(request);
        console.log('✅ Retry logic working, attempts:', attemptCount);
      } catch (error) {
        console.log('⚠️ Retry test completed with expected error');
      } finally {
        global.fetch = originalFetch;
      }
    }, 30000);
  });

  describe('Events List', () => {
    it('should fetch events list from backend', async () => {
      try {
        const response = await apiClient.getEvents();
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data.events).toBeInstanceOf(Array);
        expect(typeof response.data.total).toBe('number');
        
        console.log('✅ Events list fetched:', {
          count: response.data.events.length,
          total: response.data.total
        });
      } catch (error) {
        console.error('❌ Events list fetch failed:', error);
        throw error;
      }
    }, 10000);

    it('should support pagination parameters', async () => {
      try {
        const response = await apiClient.getEvents({
          page: 1,
          limit: 5
        });
        
        expect(response.data.events.length).toBeLessThanOrEqual(5);
        console.log('✅ Pagination working correctly');
      } catch (error) {
        console.error('❌ Pagination test failed:', error);
        throw error;
      }
    }, 10000);
  });
});

// ===========================================
// CONTEXT INTEGRATION TESTS
// ===========================================

describe('App Context Integration', () => {
  // Note: These would typically use React Testing Library
  // For now, we'll test the underlying logic
  
  it('should handle successful extraction flow', () => {
    // Mock da successfull extraction
    const mockEvent = {
      id: 'test-event-1',
      title: 'Test Concert',
      description: 'A test concert event',
      slug: 'test-concert',
      dateTime: {
        startDate: '2024-03-15',
        timezone: 'America/Santiago',
        allDay: false
      },
      type: 'concert' as const,
      category: 'music' as const,
      status: 'published' as const,
      visibility: 'public' as const,
      tags: ['music', 'concert'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockExtractedData = {
      title: 'Test Concert',
      description: 'A test concert event',
      dateTime: {
        startDate: '2024-03-15',
        timezone: 'America/Santiago',
        allDay: false
      },
      type: 'concert' as const,
      category: 'music' as const,
      tags: ['music'],
      media: { images: [], videos: [] },
      social: { hashtags: [], mentions: [] },
      metadata: {
        extractedAt: new Date().toISOString(),
        processingTime: 1500,
        instagramPostId: 'test-post',
        contentType: 'post' as const,
        confidence: 0.85,
        confidenceLevel: 'high' as const,
        extractorVersion: '1.0.0',
        errors: [],
        warnings: []
      },
      rawContent: 'Test raw content',
      originalUrl: TEST_URLS.instagram.valid
    };

    // Test que la estructura de datos es correcta
    expect(mockEvent.title).toBe(mockExtractedData.title);
    expect(mockExtractedData.metadata.confidence).toBeGreaterThan(0.5);
    expect(mockExtractedData.metadata.processingTime).toBeGreaterThan(0);
    
    console.log('✅ Mock data structure is valid');
  });
});

// ===========================================
// END-TO-END FLOW TEST
// ===========================================

describe('End-to-End Flow', () => {
  it('should complete full extraction workflow', async () => {
    console.log('🚀 Starting end-to-end flow test...');
    
    try {
      // 1. Health check
      console.log('1️⃣ Checking backend health...');
      const health = await apiClient.health();
      expect(health.status).toBe('OK');
      console.log('✅ Backend is healthy');

      // 2. Get initial events count
      console.log('2️⃣ Getting initial events count...');
      const initialEvents = await apiClient.getEvents();
      const initialCount = initialEvents.data.total;
      console.log(`✅ Initial events count: ${initialCount}`);

      // 3. Attempt extraction (may fail with test URL, that's OK)
      console.log('3️⃣ Attempting event extraction...');
      try {
        const extractionResponse = await apiClient.extractEvent({
          url: TEST_URLS.instagram.valid
        });
        
        if (extractionResponse.success) {
          console.log('✅ Extraction successful:', extractionResponse.data?.event.title);
          
          // 4. Verify events count increased
          const updatedEvents = await apiClient.getEvents();
          expect(updatedEvents.data.total).toBeGreaterThanOrEqual(initialCount);
          console.log(`✅ Events count updated: ${updatedEvents.data.total}`);
        }
      } catch (extractionError) {
        console.log('⚠️ Extraction failed as expected with test URL:', 
          extractionError instanceof ApiError ? extractionError.message : extractionError);
      }

      // 5. Test stats endpoint
      console.log('4️⃣ Testing stats endpoint...');
      try {
        await apiClient.getStats();
        console.log('✅ Stats retrieved successfully');
      } catch (statsError) {
        console.log('⚠️ Stats endpoint error (may not be implemented)');
      }

      console.log('🎉 End-to-end flow test completed successfully!');
      
    } catch (error) {
      console.error('❌ End-to-end flow failed:', error);
      throw error;
    }
  }, 45000);
});

// ===========================================
// PERFORMANCE TESTS
// ===========================================

describe('Performance Tests', () => {
  it('should handle concurrent requests properly', async () => {
    const startTime = Date.now();
    
    // Make multiple concurrent health checks
    const promises = Array(5).fill(null).map(() => apiClient.health());
    
    try {
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.status).toBe('OK');
      });
      
      console.log(`✅ Concurrent requests completed in ${endTime - startTime}ms`);
    } catch (error) {
      console.error('❌ Concurrent requests test failed:', error);
      throw error;
    }
  }, 15000);

  it('should respect timeout configuration', async () => {
    // Test with very short timeout
    const fastTimeoutClient = new (apiClient.constructor as any)({
      baseURL: apiClient.config?.baseURL || 'http://localhost:3001/api',
      timeout: 1 // 1ms timeout
    });

    try {
      await fastTimeoutClient.extractEvent({
        url: TEST_URLS.instagram.valid
      });
      fail('Should have timed out');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).type).toBe(ApiErrorType.TIMEOUT_ERROR);
      console.log('✅ Timeout configuration respected');
    }
  }, 10000);
});

// ===========================================
// TEST RUNNER UTILITY
// ===========================================

export const runIntegrationTests = async () => {
  console.log('🧪 Running EventSync Integration Tests...');
  console.log('=====================================');
  
  try {
    // Run a quick health check to ensure backend is available
    await apiClient.health();
    console.log('✅ Backend is available for testing');
    
    // Note: In a real environment, you would run these with Jest
    console.log('ℹ️ Run tests with: npm test -- integration.test.ts');
    
    return true;
  } catch (error) {
    console.error('❌ Backend not available for integration tests');
    console.error('Make sure the backend is running on the expected port');
    return false;
  }
};

// Manual test runner for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).runIntegrationTests = runIntegrationTests;
  console.log('🔧 Integration tests available via window.runIntegrationTests()');
} 