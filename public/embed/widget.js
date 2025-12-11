/**
 * CodeKit Pro - Embeddable Affiliate Widget
 * 
 * Usage:
 * <div id="codekit-affiliate" data-affiliate="hostinger"></div>
 * <script src="https://your-domain.com/embed/widget.js"></script>
 */

(function() {
  'use strict';

  const API_BASE = window.CODEKIT_API_BASE || '';
  const WIDGET_STYLES = `
    .codekit-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 16px;
      border-radius: 12px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      max-width: 320px;
    }
    
    .codekit-widget-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .codekit-widget-icon {
      width: 40px;
      height: 40px;
      background: rgba(88, 166, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .codekit-widget-icon svg {
      width: 20px;
      height: 20px;
      color: #58A6FF;
    }
    
    .codekit-widget-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }
    
    .codekit-widget-category {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 4px;
    }
    
    .codekit-widget-meta {
      margin-bottom: 16px;
    }
    
    .codekit-widget-commission {
      font-size: 14px;
      color: #4ade80;
      margin-bottom: 4px;
    }
    
    .codekit-widget-code {
      font-size: 12px;
      color: #fbbf24;
    }
    
    .codekit-widget-code code {
      background: rgba(251, 191, 36, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .codekit-widget-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px 16px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .codekit-widget-button:hover {
      background: #1d4ed8;
    }
    
    .codekit-widget-button svg {
      width: 16px;
      height: 16px;
    }
    
    .codekit-widget-powered {
      text-align: center;
      margin-top: 12px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .codekit-widget-powered a {
      color: #58A6FF;
      text-decoration: none;
    }
  `;

  const EXTERNAL_LINK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

  function injectStyles() {
    if (document.getElementById('codekit-widget-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'codekit-widget-styles';
    style.textContent = WIDGET_STYLES;
    document.head.appendChild(style);
  }

  async function fetchAffiliate(id) {
    try {
      const response = await fetch(`${API_BASE}/api/affiliates`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const affiliates = data.data || data;
      
      return affiliates.find(a => 
        a.id === id || 
        a.name.toLowerCase().replace(/\\s+/g, '-') === id.toLowerCase()
      );
    } catch (error) {
      console.error('CodeKit Widget: Failed to fetch affiliate', error);
      return null;
    }
  }

  function trackClick(affiliateId) {
    fetch(`${API_BASE}/api/affiliates/${affiliateId}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }

  function buildUrl(affiliate) {
    let url = affiliate.url;
    if (affiliate.utm) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}${affiliate.utm.replace(/^\\?/, '')}`;
    } else {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}utm_source=codekit&utm_medium=widget&utm_campaign=affiliate`;
    }
    return url;
  }

  function renderWidget(container, affiliate) {
    const html = `
      <div class="codekit-widget">
        <div class="codekit-widget-header">
          <div class="codekit-widget-icon">${EXTERNAL_LINK_ICON}</div>
          <div>
            <h3 class="codekit-widget-title">${affiliate.name}</h3>
            <span class="codekit-widget-category">${affiliate.category}</span>
          </div>
        </div>
        
        <div class="codekit-widget-meta">
          ${affiliate.commission ? `<div class="codekit-widget-commission">Comisión: ${affiliate.commission}</div>` : ''}
          ${affiliate.code ? `<div class="codekit-widget-code">Código: <code>${affiliate.code}</code></div>` : ''}
        </div>
        
        <button class="codekit-widget-button" id="codekit-btn-${affiliate.id}">
          Usar enlace de afiliado
          ${EXTERNAL_LINK_ICON}
        </button>
        
        <div class="codekit-widget-powered">
          Powered by <a href="https://codekitpro.app" target="_blank">CodeKit Pro</a>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    document.getElementById(`codekit-btn-${affiliate.id}`).addEventListener('click', () => {
      trackClick(affiliate.id);
      window.open(buildUrl(affiliate), '_blank', 'noopener,noreferrer');
    });
  }

  async function init() {
    injectStyles();
    
    const containers = document.querySelectorAll('[id^="codekit-affiliate"]');
    
    for (const container of containers) {
      const affiliateId = container.dataset.affiliate;
      if (!affiliateId) continue;
      
      const affiliate = await fetchAffiliate(affiliateId);
      if (affiliate) {
        renderWidget(container, affiliate);
      } else {
        container.innerHTML = '<p style="color: #888; font-size: 12px;">Widget no disponible</p>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

