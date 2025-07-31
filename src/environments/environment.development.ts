export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000',
  appName: 'AsoCabra (Dev)',
  version: '1.0.0-dev',
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en'],
  sessionTimeout: 120, // minutos
  sessionCheckInterval: 5, // minutos
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100]
  },
  features: {
    darkMode: true,
    notifications: true,
    fileUpload: true,
    exportData: true
  },
  debug: {
    enableLogging: true,
    showApiCalls: true,
    showPerformanceMetrics: true
  },
  apiPrefix: '/api',
  apiVersion: 'v1'
};
