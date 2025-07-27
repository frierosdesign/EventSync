const { InstagramScraperService } = require('./dist/services/InstagramScraperService');
const { OpenAIVisionService } = require('./dist/services/OpenAIVisionService');

async function testRealScraping() {
  console.log('🧪 Testing Real Instagram Scraping with Playwright...\n');

  try {
    // Inicializar servicios
    const scraper = InstagramScraperService.getInstance();
    const visionService = OpenAIVisionService.getInstance();

    // URL de prueba (puedes cambiar esta por una URL real de Instagram)
    const testUrl = 'https://www.instagram.com/p/DMNP03kMuCP/';
    
    console.log(`📸 Testing URL: ${testUrl}\n`);

    // Paso 1: Extraer datos del post
    console.log('🔍 Step 1: Extracting post data...');
    const postData = await scraper.extractPostData(testUrl);
    
    if (postData) {
      console.log('✅ Post data extracted successfully:');
      console.log(`   - ID: ${postData.id}`);
      console.log(`   - Username: ${postData.username || 'N/A'}`);
      console.log(`   - Caption: ${postData.caption ? postData.caption.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`   - Hashtags: ${postData.hashtags.length}`);
      console.log(`   - Mentions: ${postData.mentions.length}`);
      console.log(`   - Is Video: ${postData.isVideo}`);
      console.log(`   - Image URL: ${postData.imageUrl}`);
      console.log('');
    } else {
      console.log('❌ Failed to extract post data');
      return;
    }

    // Paso 2: Descargar imagen
    console.log('📥 Step 2: Downloading image...');
    const imageData = await scraper.downloadImage(postData.imageUrl);
    
    if (imageData) {
      console.log('✅ Image downloaded successfully:');
      console.log(`   - Size: ${imageData.size} bytes`);
      console.log(`   - Content Type: ${imageData.contentType}`);
      console.log('');
    } else {
      console.log('❌ Failed to download image');
      return;
    }

    // Paso 3: Procesar con OpenAI Vision
    console.log('🤖 Step 3: Processing with OpenAI Vision...');
    const visionResult = await visionService.extractEventFromUrl(testUrl);
    
    if (visionResult.success) {
      console.log('✅ Vision processing completed successfully:');
      console.log(`   - Method: ${visionResult.extractionMethod}`);
      console.log(`   - Confidence: ${visionResult.confidence}`);
      console.log(`   - Processing Time: ${visionResult.processingTime}ms`);
      console.log(`   - Title: ${visionResult.data?.title}`);
      console.log(`   - Description: ${visionResult.data?.description ? visionResult.data.description.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`   - Location: ${visionResult.data?.location?.name}, ${visionResult.data?.location?.city}`);
      console.log(`   - Date: ${visionResult.data?.dateTime?.startDate}`);
      console.log(`   - Time: ${visionResult.data?.dateTime?.startTime}`);
      console.log(`   - Type: ${visionResult.data?.type}`);
      console.log(`   - Category: ${visionResult.data?.category}`);
      console.log('');
      
      if (visionResult.warnings && visionResult.warnings.length > 0) {
        console.log('⚠️ Warnings:');
        visionResult.warnings.forEach(warning => console.log(`   - ${warning}`));
        console.log('');
      }
    } else {
      console.log('❌ Vision processing failed:');
      console.log(`   - Error: ${visionResult.error}`);
      console.log(`   - Method: ${visionResult.extractionMethod}`);
      console.log('');
    }

    // Paso 4: Mostrar estadísticas
    console.log('📊 Step 4: Service Statistics...');
    const scraperStats = scraper.getStats();
    const visionStats = visionService.getStats();
    
    console.log('Instagram Scraper Stats:');
    console.log(`   - Status: ${scraperStats.status}`);
    console.log(`   - Browser Initialized: ${scraperStats.browserInitialized}`);
    console.log(`   - Has Browser: ${scraperStats.hasBrowser}`);
    console.log('');
    
    console.log('OpenAI Vision Stats:');
    console.log(`   - Total Extractions: ${visionStats.totalExtractions}`);
    console.log(`   - Success Rate: ${visionStats.successRate}`);
    console.log(`   - Queue Length: ${visionStats.rateLimitQueueLength}`);
    console.log('');

    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  } finally {
    // Limpiar recursos
    const scraper = InstagramScraperService.getInstance();
    await scraper.cleanup();
    
    const visionService = OpenAIVisionService.getInstance();
    await visionService.cleanup();
    
    console.log('🧹 Resources cleaned up');
    process.exit(0);
  }
}

// Ejecutar el test
testRealScraping(); 