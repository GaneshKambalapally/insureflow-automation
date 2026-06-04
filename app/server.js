/**
 * InsureFlow - Main Server
 * Insurance Payment Portal - Node.js + Express + sql.js SQLite
 */
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const { requestLogger, logger } = require('./middleware/logger.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const { initDb } = require('./database/db');

const authRoutes    = require('./routes/auth.routes');
const policyRoutes  = require('./routes/policy.routes');
const paymentRoutes = require('./routes/payment.routes');
const claimsRoutes  = require('./routes/claims.routes');
const refundRoutes  = require('./routes/refund.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title:'InsureFlow API', version:'1.0.0', description:'Insurance Payment Portal REST API' },
    servers: [{ url:`http://localhost:${PORT}`, description:'Development server' }],
    components: { securitySchemes: { BearerAuth: { type:'http', scheme:'bearer', bearerFormat:'JWT' } } },
    security: [{ BearerAuth:[] }]
  },
  apis: ['./routes/*.js']
};

async function startServer() {
  // Initialize DB first
  await initDb();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api/auth',     authRoutes);
  app.use('/api/policies', policyRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/claims',   claimsRoutes);
  app.use('/api/refunds',  refundRoutes);

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/api/health', (req, res) => res.json({
    success:true, app:'InsureFlow', version:'1.0.0', env:process.env.ENV, timestamp:new Date().toISOString()
  }));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.info(`🚀 InsureFlow running on http://localhost:${PORT}`);
    logger.info(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
  });
}

startServer().catch(err => { console.error('Server failed to start:', err); process.exit(1); });
module.exports = app;
