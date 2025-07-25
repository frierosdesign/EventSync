const playwright = require('playwright');

export interface ScrapedContent {
  images: string[];
  text: string;
  location?: string;
  url: string;
}

async function getInstagramContent(url: string): Promise<ScrapedContent> {
  // Validar URL primero
  if (!url.includes('instagram.com')) {
    throw new Error('URL must be from Instagram');
  }

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  
  try {
    // Configurar user agent real y viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Ir a la página con timeout
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Esperar a que cargue el contenido
    await page.waitForSelector('article, [role="main"]', { timeout: 10000 });

    // Extraer contenido específico de Instagram
    const content = await page.evaluate(() => {
      // @ts-ignore - Browser context, TypeScript types not available
      const postImages = Array.from(document.querySelectorAll('article img, [role="main"] img'))
        .map((img: any) => img.src)
        .filter((src: string) => 
          src.includes('scontent') || // URLs típicas de contenido IG
          src.includes('instagram.com') && 
          !src.includes('profile') && // Excluir fotos de perfil
          !src.includes('avatar')     // Excluir avatares
        );

      // @ts-ignore - Browser context
      const captions = Array.from(document.querySelectorAll('article h1, [data-testid="caption"]'))
        .map((el: any) => el.textContent.trim())
        .filter((text: string) => text.length > 0);

      // @ts-ignore - Browser context
      const locationEl = document.querySelector('[data-testid="location"]');
      const location = locationEl ? locationEl.textContent || '' : '';

      return {
        images: [...new Set(postImages)], // Eliminar duplicados
        text: captions.join(' '),
        location: location,
        // @ts-ignore - Browser context
        url: window.location.href
      };
    });

    return content;

  } catch (error: any) {
    console.error('Error scraping Instagram:', error.message);
    
    // Intentar método alternativo más simple
    try {
      const fallbackContent = await page.evaluate(() => ({
        // @ts-ignore - Browser context
        images: Array.from(document.querySelectorAll('img[src*="scontent"]'))
          .map((img: any) => img.src)
          .slice(0, 5), // Limitar a 5 imágenes máximo
        // @ts-ignore - Browser context
        text: document.body.innerText.slice(0, 1000), // Primeros 1000 chars
        location: '',
        // @ts-ignore - Browser context
        url: window.location.href
      }));
      
      return fallbackContent;
    } catch (fallbackError: any) {
      throw new Error(`Failed to scrape Instagram content: ${error.message}`);
    }
    
  } finally {
    await browser.close();
  }
}

// Función con rate limiting
let lastRequest = 0;
const MIN_DELAY = 2000; // 2 segundos entre requests

export async function getInstagramContentSafe(url: string): Promise<ScrapedContent> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequest;
  
  if (timeSinceLastRequest < MIN_DELAY) {
    await new Promise(resolve => 
      setTimeout(resolve, MIN_DELAY - timeSinceLastRequest)
    );
  }
  
  lastRequest = Date.now();
  return await getInstagramContent(url);
} 