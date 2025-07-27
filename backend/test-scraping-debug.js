const { InstagramScraperService } = require('./dist/services/InstagramScraperService');

async function debugScraping() {
  console.log('🔍 Instagram Scraping Debug Tool\n');

  const scraper = InstagramScraperService.getInstance();
  
  // URLs de prueba
  const testUrls = [
    'https://www.instagram.com/p/DMNP03kMuCP/',
    'https://www.instagram.com/p/DI63hrPqxcR/?img_index=1',
    'https://www.instagram.com/p/test123/'
  ];

  for (const url of testUrls) {
    console.log(`\n📸 Testing URL: ${url}`);
    console.log('=' .repeat(60));
    
    try {
      console.log('🔍 Step 1: Validating URL...');
      const isValid = await scraper.validateUrl(url);
      console.log(`   ✅ URL Valid: ${isValid}`);
      
      if (!isValid) {
        console.log('   ❌ URL is not valid, skipping...');
        continue;
      }
      
      console.log('\n🔍 Step 2: Extracting post data...');
      const startTime = Date.now();
      const postData = await scraper.extractPostData(url);
      const endTime = Date.now();
      
      if (postData) {
        console.log('   ✅ Post data extracted successfully:');
        console.log(`      - ID: ${postData.id}`);
        console.log(`      - Username: ${postData.username || 'N/A'}`);
        console.log(`      - Caption length: ${postData.caption ? postData.caption.length : 0} chars`);
        console.log(`      - Hashtags: ${postData.hashtags.length} - ${postData.hashtags.join(', ')}`);
        console.log(`      - Mentions: ${postData.mentions.length} - ${postData.mentions.join(', ')}`);
        console.log(`      - Is Video: ${postData.isVideo}`);
        console.log(`      - Image URL: ${postData.imageUrl}`);
        console.log(`      - Processing time: ${endTime - startTime}ms`);
        
        // Verificar si es imagen real o placeholder
        const isRealImage = !postData.imageUrl.includes('picsum.photos');
        console.log(`      - Real image: ${isRealImage ? 'Yes' : 'No (placeholder)'}`);
        
        // Verificar si el caption parece real
        const isRealCaption = postData.caption && postData.caption.length > 50;
        console.log(`      - Real caption: ${isRealCaption ? 'Yes' : 'No'}`);
        
        console.log('\n🔍 Step 3: Downloading image...');
        const imageData = await scraper.downloadImage(postData.imageUrl);
        
        if (imageData) {
          console.log('   ✅ Image downloaded successfully:');
          console.log(`      - Size: ${imageData.size} bytes`);
          console.log(`      - Content Type: ${imageData.contentType}`);
          console.log(`      - Is placeholder: ${imageData.url.includes('picsum.photos') ? 'Yes' : 'No'}`);
        } else {
          console.log('   ❌ Failed to download image');
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
  console.log('\n🧹 Resources cleaned up');
}

// Ejecutar el debug
debugScraping().catch(console.error); 