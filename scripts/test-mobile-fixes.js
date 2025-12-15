#!/usr/bin/env node
/**
 * Script de Testing para Fixes Móviles
 * 
 * Este script debe ejecutarse en la consola del navegador móvil
 * después de cargar la aplicación.
 * 
 * Copia y pega el contenido en la consola del navegador.
 */

(function() {
  'use strict';

  console.log('🧪 Iniciando tests de fixes móviles...');
  console.log('==========================================\n');

  const results = {
    serviceWorker: { passed: false, message: '' },
    autoReload: { passed: false, message: '' },
    removeChildErrors: { passed: false, count: 0 },
    reactErrors: { passed: false, count: 0 },
    chunkErrors: { passed: false, count: 0 },
    treeStability: { passed: false, message: '' }
  };

  // Test 1: Service Worker
  console.log('1️⃣ Verificando Service Worker...');
  navigator.serviceWorker.getRegistrations()
    .then(regs => {
      if (regs.length === 0) {
        results.serviceWorker.passed = true;
        results.serviceWorker.message = '✅ OK: No hay Service Workers registrados';
        console.log(results.serviceWorker.message);
      } else {
        results.serviceWorker.message = `❌ ERROR: ${regs.length} Service Worker(s) registrado(s)`;
        console.error(results.serviceWorker.message);
        regs.forEach(r => console.log('  - Scope:', r.scope));
      }
    })
    .catch(err => {
      results.serviceWorker.message = '⚠️ No se pudo verificar (normal si no hay SW API)';
      console.warn(results.serviceWorker.message);
    });

  // Test 2: Auto-reload
  console.log('\n2️⃣ Monitoreando auto-reloads...');
  let reloadCount = 0;
  const originalReload = window.location.reload;
  window.location.reload = function() {
    reloadCount++;
    results.autoReload.passed = false;
    results.autoReload.message = `❌ AUTO-RELOAD DETECTADO #${reloadCount}`;
    console.error(results.autoReload.message);
    console.trace('Stack trace:');
    return originalReload.apply(this, arguments);
  };

  // Test 3-5: Monitorear errores
  console.log('\n3️⃣ Monitoreando errores (60 segundos)...');
  
  window.addEventListener('error', (e) => {
    const msg = e.message.toLowerCase();
    
    if (msg.includes('removechild') || msg.includes('remove child')) {
      results.removeChildErrors.count++;
      console.error('❌ removeChild error #' + results.removeChildErrors.count, e);
    }
    
    if (msg.includes('react error #31') || 
        msg.includes('$$typeof') ||
        msg.includes('objects are not valid')) {
      results.reactErrors.count++;
      console.error('❌ React Error #31/#185 #' + results.reactErrors.count, e);
    }
    
    if (msg.includes('chunk') || 
        msg.includes('failed to fetch dynamically imported module')) {
      results.chunkErrors.count++;
      console.error('❌ ChunkLoadError #' + results.chunkErrors.count, e);
    }
  });

  // Test 6: Tree Stability
  console.log('\n4️⃣ Verificando estabilidad del árbol React...');
  setTimeout(() => {
    const hasDesktop = document.querySelector('.hidden.md\\:block');
    const hasMobile = document.querySelector('.block.md\\:hidden');
    
    if (hasDesktop && hasMobile) {
      results.treeStability.passed = true;
      results.treeStability.message = '✅ OK: Ambos wrappers (desktop/mobile) presentes';
    } else {
      results.treeStability.message = '⚠️ WARNING: Wrappers CSS no encontrados';
    }
    console.log(results.treeStability.message);
  }, 1000);

  // Reporte final después de 60 segundos
  setTimeout(() => {
    console.log('\n==========================================');
    console.log('📊 REPORTE FINAL DE TESTS');
    console.log('==========================================\n');
    
    // Service Worker
    console.log('Service Worker:', results.serviceWorker.message || '⏳ No verificado');
    
    // Auto-reload
    if (reloadCount === 0) {
      results.autoReload.passed = true;
      results.autoReload.message = '✅ OK: No hay auto-reloads';
    }
    console.log('Auto-reloads:', results.autoReload.message);
    
    // removeChild
    if (results.removeChildErrors.count === 0) {
      results.removeChildErrors.passed = true;
      console.log('removeChild errors: ✅ OK (0 errores)');
    } else {
      console.error(`removeChild errors: ❌ ERROR (${results.removeChildErrors.count} errores)`);
    }
    
    // React errors
    if (results.reactErrors.count === 0) {
      results.reactErrors.passed = true;
      console.log('React errors: ✅ OK (0 errores)');
    } else {
      console.error(`React errors: ❌ ERROR (${results.reactErrors.count} errores)`);
    }
    
    // Chunk errors
    if (results.chunkErrors.count === 0) {
      results.chunkErrors.passed = true;
      console.log('ChunkLoadErrors: ✅ OK (0 errores)');
    } else {
      console.error(`ChunkLoadErrors: ❌ ERROR (${results.chunkErrors.count} errores)`);
    }
    
    // Tree stability
    console.log('Tree stability:', results.treeStability.message || '⏳ No verificado');
    
    // Resumen final
    console.log('\n==========================================');
    const allPassed = 
      results.serviceWorker.passed &&
      results.autoReload.passed &&
      results.removeChildErrors.passed &&
      results.reactErrors.passed &&
      results.chunkErrors.passed &&
      results.treeStability.passed;
    
    if (allPassed) {
      console.log('✅ TODOS LOS TESTS PASARON');
      console.log('La aplicación móvil está estable.');
    } else {
      console.error('❌ ALGUNOS TESTS FALLARON');
      console.error('Revisa los errores arriba.');
    }
    console.log('==========================================\n');
    
    // Restaurar reload original
    window.location.reload = originalReload;
    
  }, 60000);

  console.log('\n⏳ Esperando 60 segundos para monitorear errores...');
  console.log('💡 Mantén la app abierta y navega normalmente.\n');
})();
