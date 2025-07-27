const { InstagramScraperService } = require('./dist/services/InstagramScraperService');
const { OpenAIVisionService } = require('./dist/services/OpenAIVisionService');
const fs = require('fs/promises');
const path = require('path');

// Cargar variables de entorno desde .env
require('dotenv').config();

// Verificar API key de OpenAI
if (!process.env.AI_MODEL_API_KEY) {
  console.log('⚠️  No se encontró AI_MODEL_API_KEY en las variables de entorno');
  console.log('📝 Asegúrate de que el archivo .env contenga la clave de OpenAI\n');
}

async function testWithCookies() {
  console.log('🍪 Testing Instagram Scraping with Cookies...\n');
  
  try {
    // Verificar si existe el archivo de cookies
    const cookiesPath = path.join(__dirname, 'instagram-cookies.json');
    const cookiesExist = await fs.access(cookiesPath).then(() => true).catch(() => false);
    
    if (!cookiesExist) {
      console.log('⚠️  No se encontró el archivo instagram-cookies.json');
      console.log('📝 Para usar cookies, crea el archivo instagram-cookies.json con las cookies de Instagram');
      console.log('💡 Puedes exportar las cookies desde tu navegador o usar herramientas como EditThisCookie\n');
    } else {
      console.log('✅ Archivo de cookies encontrado');
      const cookiesData = await fs.readFile(cookiesPath, 'utf-8');
      const cookies = JSON.parse(cookiesData);
      console.log(`📊 Cookies cargadas: ${cookies.length} cookies\n`);
    }

    const scraper = InstagramScraperService.getInstance();
    const visionService = OpenAIVisionService.getInstance();
    
    // URLs de prueba
    const testUrls = [
      'https://www.instagram.com/p/DI63hrPqxcR/?img_index=1',
      'https://www.instagram.com/p/DMNP03kMuCP/',
      'https://www.instagram.com/p/test123/'
    ];

    for (const url of testUrls) {
      console.log(`\n📸 Testing URL: ${url}`);
      console.log('=' .repeat(60));
      
      try {
        console.log('🔍 Step 1: Extracting post data with cookies...');
        const startTime = Date.now();
        const postData = await scraper.extractPostData(url);
        const endTime = Date.now();
        
        if (postData) {
          console.log('   ✅ Post data extracted successfully:');
          console.log(`      - ID: ${postData.id}`);
          console.log(`      - Username: ${postData.username || 'N/A'}`);
          console.log(`      - Caption length: ${postData.caption ? postData.caption.length : 0} chars`);
          console.log(`      - Caption preview: ${postData.caption ? postData.caption.substring(0, 100) + '...' : 'N/A'}`);
          console.log(`      - Hashtags: ${postData.hashtags.length} - ${postData.hashtags.join(', ')}`);
          console.log(`      - Mentions: ${postData.mentions.length} - ${postData.mentions.join(', ')}`);
          console.log(`      - Is Video: ${postData.isVideo}`);
          console.log(`      - Image URL: ${postData.imageUrl.substring(0, 80)}...`);
          console.log(`      - Processing time: ${endTime - startTime}ms`);
          
          // Verificar si es imagen real o placeholder
          const isRealImage = !postData.imageUrl.includes('picsum.photos');
          console.log(`      - Real image: ${isRealImage ? 'Yes' : 'No (placeholder)'}`);
          
          // Verificar si el caption parece real
          const isRealCaption = postData.caption && postData.caption.length > 50;
          console.log(`      - Real caption: ${isRealCaption ? 'Yes' : 'No'}`);
          
          console.log('\n🔍 Step 2: Processing with OpenAI Vision...');
          const visionStartTime = Date.now();
          const visionResult = await visionService.extractWithVisionAI(url);
          const visionEndTime = Date.now();
          
          if (visionResult.success) {
            console.log('   ✅ OpenAI Vision processing successful:');
            console.log(`      - Method: ${visionResult.method}`);
            console.log(`      - Confidence: ${visionResult.confidence}`);
            console.log(`      - Processing time: ${visionEndTime - visionStartTime}ms`);
            
            if (visionResult.data) {
              console.log(`      - Title: ${visionResult.data.title || 'N/A'}`);
              console.log(`      - Description: ${visionResult.data.description ? visionResult.data.description.substring(0, 100) + '...' : 'N/A'}`);
              console.log(`      - Date: ${visionResult.data.date || 'N/A'}`);
              console.log(`      - Location: ${visionResult.data.location?.name || 'N/A'}`);
            }
          } else {
            console.log('   ❌ OpenAI Vision processing failed:');
            console.log(`      - Error: ${visionResult.error}`);
          }
          
        } else {
          console.log('   ❌ Failed to extract post data');
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        
        // Análisis del error
        if (error.message.includes('Timeout')) {
          console.log('   🔍 Analysis: Instagram timeout - possible anti-bot protection');
        } else if (error.message.includes('blocking')) {
          console.log('   🔍 Analysis: Instagram blocking detected');
        } else if (error.message.includes('network')) {
          console.log('   🔍 Analysis: Network connectivity issue');
        } else {
          console.log('   🔍 Analysis: Unknown error type');
        }
      }
    }
    
    console.log('\n📊 Final Statistics:');
    const stats = scraper.getStats();
    console.log(`   - Service Status: ${stats.status}`);
    console.log(`   - Browser Initialized: ${stats.browserInitialized}`);
    console.log(`   - Has Browser: ${stats.hasBrowser}`);
    
    // Limpiar recursos
    await scraper.cleanup();
    await visionService.cleanup();
    console.log('\n🧹 Resources cleaned up');
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Ejecutar el test
testWithCookies().catch(console.error); 