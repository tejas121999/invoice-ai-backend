const express = require('express');
const cors = require('cors');
const config = require('./config');
const healthRoutes = require('./routes/health.routes');
const apiRoutes = require('./routes/index');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

const uploadMount = `/${config.uploadPath.split('/').filter(Boolean).join('/')}`;
app.use(uploadMount, express.static(config.uploadAbsolutePath));

app.use(healthRoutes);
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
