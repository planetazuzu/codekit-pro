export interface APIGuide {
  id: string;
  name: string;
  url: string;
  apiUrl: string;
  steps: string[];
  pricing?: string;
  freeTier?: string;
}

export const apiGuides: APIGuide[] = [
  {
    id: 'openai',
    name: 'OpenAI API',
    url: 'https://platform.openai.com',
    apiUrl: 'https://api.openai.com/v1',
    steps: [
      'Ve a https://platform.openai.com',
      'Crea una cuenta o inicia sesión',
      'Haz clic en tu perfil (arriba derecha) → "View API keys"',
      'Haz clic en "Create new secret key"',
      'Copia el token (solo se muestra una vez)',
      'Guarda el token de forma segura (ej: variable de entorno)'
    ],
    pricing: 'Pay-as-you-go, desde $0.002 por 1K tokens',
    freeTier: '$5 crédito inicial al registrarte'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude API',
    url: 'https://console.anthropic.com',
    apiUrl: 'https://api.anthropic.com/v1',
    steps: [
      'Ve a https://console.anthropic.com',
      'Crea una cuenta o inicia sesión',
      'Ve a "API Keys" en el menú lateral',
      'Haz clic en "Create Key"',
      'Dale un nombre descriptivo',
      'Copia el API key (empieza con sk-ant-)',
      'Guarda el token de forma segura'
    ],
    pricing: 'Pay-as-you-go, desde $0.008 por 1K tokens',
    freeTier: 'Crédito inicial disponible'
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini API',
    url: 'https://makersuite.google.com/app/apikey',
    apiUrl: 'https://generativelanguage.googleapis.com/v1',
    steps: [
      'Ve a https://makersuite.google.com/app/apikey',
      'Inicia sesión con tu cuenta de Google',
      'Haz clic en "Create API Key"',
      'Selecciona un proyecto (o crea uno nuevo)',
      'Copia el API key generado',
      'Guarda el token de forma segura'
    ],
    pricing: 'Gratis con límites generosos',
    freeTier: '60 requests/minuto gratis'
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    url: 'https://github.com/settings/copilot',
    apiUrl: 'N/A (extensión de editor)',
    steps: [
      'Ve a https://github.com/settings/copilot',
      'Inicia sesión con tu cuenta de GitHub',
      'Haz clic en "Subscribe to Copilot"',
      'Elige plan individual ($10/mes) o verifica si eres estudiante',
      'Instala la extensión en tu editor (VS Code, Cursor, etc.)',
      'Inicia sesión desde el editor cuando se te solicite'
    ],
    pricing: '$10/mes (gratis para estudiantes)',
    freeTier: 'Gratis para estudiantes verificados'
  },
  {
    id: 'replit-agent',
    name: 'Replit Agent',
    url: 'https://replit.com/site/ghostwriter',
    apiUrl: 'N/A (integrado en Replit)',
    steps: [
      'Ve a https://replit.com y crea cuenta',
      'Abre o crea un proyecto',
      'Haz clic en el icono de "Agent" en la barra lateral',
      'Activa el agente (requiere suscripción)',
      'Usa comandos como "@Agent crear componente React"'
    ],
    pricing: 'Incluido en planes de Replit',
    freeTier: 'Limitado en plan gratuito'
  }
];

