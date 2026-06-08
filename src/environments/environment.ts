export const environment = {
  production: true,
  apiUrl: 'https://api.asocabravenezuela.com',
  appName: 'AsoCaprinos',
  version: '1.0.0',
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
  apiPrefix: '/api',
  apiVersion: 'v1'
};
