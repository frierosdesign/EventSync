// Script de prueba para verificar la funcionalidad de scraping
const fetch = require('node-fetch');

async function testInstagramScraping() {
  try {
    console.log('🧪 Probando extracción de evento de Instagram...\n');
    
    // URL de ejemplo de Instagram (puedes cambiarla por una real)
    const testUrl = 'https://www.instagram.com/p/C123456789/';
    
    const response = await fetch('http://localhost:3001/api/events/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instagramUrl: testUrl
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Respuesta del servidor:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n🎉 ¡Extracción exitosa!');
      console.log('📝 Título:', result.data.title);
      console.log('📅 Fecha:', result.data.date);
      console.log('⏰ Hora:', result.data.time || 'No especificada');
      console.log('📍 Ubicación:', result.data.location || 'No especificada');
      console.log('🔗 URL Original:', result.data.instagramUrl);
    } else {
      console.log('❌ La extracción falló');
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.log('\n💡 Asegúrate de que el servidor backend esté ejecutándose en http://localhost:3001');
  }
}

// Función para probar obtener todos los eventos
async function testGetAllEvents() {
  try {
    console.log('\n📋 Obteniendo todos los eventos...\n');
    
    const response = await fetch('http://localhost:3001/api/events');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Eventos en la base de datos:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.data.length > 0) {
      console.log(`\n📊 Total de eventos: ${result.count}`);
      result.data.forEach((event, index) => {
        console.log(`\n🎫 Evento ${index + 1}:`);
        console.log(`   Título: ${event.title}`);
        console.log(`   Fecha: ${event.date}`);
        console.log(`   Instagram: ${event.instagramUrl}`);
      });
    } else {
      console.log('\n📭 No hay eventos en la base de datos aún');
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo eventos:', error.message);
  }
}

// Ejecutar las pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de EventSync API\n');
  console.log('=' .repeat(50));
  
  await testInstagramScraping();
  await testGetAllEvents();
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Pruebas completadas');
  console.log('\n💻 Para probar manualmente:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   API: http://localhost:3001/api/events');
}

// Verificar si el script se ejecuta directamente
if (require.main === module) {
  runTests();
}

module.exports = { testInstagramScraping, testGetAllEvents }; 