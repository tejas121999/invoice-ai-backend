const path = require('path');
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const apiRoutes = require('./routes/index');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const uploadService = require('./modules/upload/upload.service');

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  `/${uploadService.UPLOADS_RELATIVE}`,
  express.static(path.join(uploadService.getUploadsAbsolutePath())),
);

app.use(healthRoutes);
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
