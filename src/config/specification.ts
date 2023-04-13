import swaggerJsDoc from 'swagger-jsdoc';
import config from '../config';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'News Resourse',
      description: 'Metalamp IRM',
      version: '0.0.1',
    },
    servers: [{ url: config.apiUrl, description: 'Dev server' }],
  },
  apis: ['**/routes/*.ts', '**/openapi/*.yml'],
};

const specification = swaggerJsDoc(options);

export default specification;
