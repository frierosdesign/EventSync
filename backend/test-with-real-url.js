const { InstagramScraperService } = require('./dist/services/InstagramScraperService');
const { OpenAIVisionService } = require('./dist/services/OpenAIVisionService');

// Configurar API key de OpenAI (reemplaza con tu clave real)
process.env.AI_MODEL_API_KEY = 'sk-demo-key-for-testing'; // Cambia esto por tu clave real

async function testWithRealUrl() {
  console.log('🧪 Testing with Real Instagram URL and OpenAI...\n');

  try {
    // Inicializar servicios
    const scraper = InstagramScraperService.getInstance();
    const visionService = OpenAIVisionService.getInstance();

    // URL real de Instagram (reemplaza con una URL real)
    const realUrl = 'https://www.instagram.com/p/DMNP03kMuCP/';
    
    console.log(`📸 Testing with real URL: ${realUrl}\n`);

    // Paso 1: Extraer datos del post
    console.log('🔍 Step 1: Extracting post data with Playwright...');
    const postData = await scraper.extractPostData(realUrl);
    
    if (postData) {
      console.log('✅ Post data extracted successfully:');
      console.log(`   - ID: ${postData.id}`);
      console.log(`   - Username: ${postData.username || 'N/A'}`);
      console.log(`   - Caption: ${postData.caption ? postData.caption.substring(0, 200) + '...' : 'N/A'}`);
      console.log(`   - Hashtags: ${postData.hashtags.length} - ${postData.hashtags.join(', ')}`);
      console.log(`   - Mentions: ${postData.mentions.length} - ${postData.mentions.join(', ')}`);
      console.log(`   - Is Video: ${postData.isVideo}`);
      console.log(`   - Image URL: ${postData.imageUrl}`);
      console.log('');
    } else {
      console.log('❌ Failed to extract post data');
      return;
    }

    // Paso 2: Descargar imagen real
    console.log('📥 Step 2: Downloading real image...');
    const imageData = await scraper.downloadImage(postData.imageUrl);
    
    if (imageData) {
      console.log('✅ Real image downloaded successfully:');
      console.log(`   - Size: ${imageData.size} bytes`);
      console.log(`   - Content Type: ${imageData.contentType}`);
      console.log(`   - Is placeholder: ${imageData.url.includes('picsum.photos') ? 'Yes' : 'No'}`);
      console.log('');
    } else {
      console.log('❌ Failed to download image');
      return;
    }

    // Paso 3: Procesar con OpenAI Vision (si está configurado)
    console.log('🤖 Step 3: Processing with OpenAI Vision...');
    const visionResult = await visionService.extractEventFromUrl(realUrl);
    
    if (visionResult.success) {
      console.log('✅ Vision processing completed successfully:');
      console.log(`   - Method: ${visionResult.extractionMethod}`);
      console.log(`   - Confidence: ${visionResult.confidence}`);
      console.log(`   - Processing Time: ${visionResult.processingTime}ms`);
      console.log(`   - Title: ${visionResult.data?.title}`);
      console.log(`   - Description: ${visionResult.data?.description ? visionResult.data.description.substring(0, 150) + '...' : 'N/A'}`);
      console.log(`   - Location: ${visionResult.data?.location?.name}, ${visionResult.data?.location?.city}`);
      console.log(`   - Date: ${visionResult.data?.dateTime?.startDate}`);
      console.log(`   - Time: ${visionResult.data?.dateTime?.startTime}`);
      console.log(`   - Type: ${visionResult.data?.type}`);
      console.log(`   - Category: ${visionResult.data?.category}`);
      console.log(`   - Hashtags: ${visionResult.data?.social?.hashtags?.join(', ') || 'None'}`);
      console.log(`   - Mentions: ${visionResult.data?.social?.mentions?.join(', ') || 'None'}`);
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

    // Paso 4: Comparar datos extraídos vs datos reales
    console.log('📊 Step 4: Data Comparison...');
    console.log('Real Instagram Data vs Extracted Event Data:');
    console.log(`   - Real caption: ${postData.caption ? postData.caption.substring(0, 100) + '...' : 'N/A'}`);
    console.log(`   - Extracted title: ${visionResult.data?.title || 'N/A'}`);
    console.log(`   - Real hashtags: ${postData.hashtags.join(', ')}`);
    console.log(`   - Extracted hashtags: ${visionResult.data?.social?.hashtags?.join(', ') || 'None'}`);
    console.log(`   - Real mentions: ${postData.mentions.join(', ')}`);
    console.log(`   - Extracted mentions: ${visionResult.data?.social?.mentions?.join(', ') || 'None'}`);
    console.log('');

    // Paso 5: Mostrar estadísticas
    console.log('📈 Step 5: Service Statistics...');
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
    console.log('\n💡 Next steps:');
    console.log('   1. Replace the API key with a real OpenAI key');
    console.log('   2. Test with different Instagram URLs');
    console.log('   3. Check the extracted event data quality');

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
testWithRealUrl(); 