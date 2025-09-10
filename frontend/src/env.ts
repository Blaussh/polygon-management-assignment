// Environment configuration with validation

interface Config {
  API_URL: string;
  API_TIMEOUT: number;
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  BACKGROUND_IMAGE_URL: string;
  ENABLE_DEVTOOLS: boolean;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for environment variable ${key}: ${value}`);
  }
  return parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (!value) return defaultValue;

  return value.toLowerCase() === 'true';
}

export const config: Config = {
  API_URL: getEnvVar('VITE_API_URL', 'http://localhost:3001'),
  API_TIMEOUT: getEnvNumber('VITE_API_TIMEOUT', 15000),
  CANVAS_WIDTH: getEnvNumber('VITE_CANVAS_WIDTH', 1920),
  CANVAS_HEIGHT: getEnvNumber('VITE_CANVAS_HEIGHT', 1080),
  BACKGROUND_IMAGE_URL: getEnvVar(
    'VITE_BACKGROUND_IMAGE_URL',
    'https://picsum.photos/1920/1080'
  ),
  ENABLE_DEVTOOLS: getEnvBoolean('VITE_ENABLE_DEVTOOLS', true),
};

// Validate configuration
if (config.API_TIMEOUT < 1000) {
  throw new Error('API_TIMEOUT must be at least 1000ms');
}

if (config.CANVAS_WIDTH < 100 || config.CANVAS_HEIGHT < 100) {
  throw new Error('Canvas dimensions must be at least 100x100');
}
