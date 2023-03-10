import swaggerJsDoc from 'swagger-jsdoc';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'News Resourse',
      description: 'Metalamp IRM',
      version: '0.0.1',
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Dev server' },
    ],
  },
  apis: ['**/routes/*.ts', '**/openapi/*.yml'],
};

const specification = swaggerJsDoc(options);

export default specification;
