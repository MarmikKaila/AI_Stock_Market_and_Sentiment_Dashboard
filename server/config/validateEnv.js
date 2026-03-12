function validateEnv() {
  const required = ['MONGO_URI', 'GEMINI_API_KEY'];
  const optional = ['ALPHA_VANTAGE_API_KEY', 'NEWSAPI_KEY', 'PORT', 'CORS_ORIGINS'];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Create a .env file based on .env.example');
    process.exit(1);
  }

  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(`WARNING: Missing optional environment variables: ${missingOptional.join(', ')}`);
    console.warn('Some features may use mock data or defaults.');
  }
}

module.exports = { validateEnv };
