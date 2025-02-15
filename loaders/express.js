const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const express = require('express');
require('express-async-errors');
const routes = require('../routes');
const requestError = require('../loaders/requestError');

const app = express();

// For parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// For securing app by setting various HTTP headers
app.use(helmet());

// For enabling CORS
app.use(cors());

// For compressing response body
app.use(compression());

// For logging requests
app.use(morgan('dev'));

// Add a link for API doc
app.get('/', (req, res) => res.send('API documentation can be found <a href="https://documenter.getpostman.com/view/3899486/SVmtxKT6">here</a>'));

// Register routes
app.use('/api', routes);

// Error handler
app.use((req, res, next) => {
  const err = new Error(`${req.method} ${req.path} not found`);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (!err.status) err.status = 500;
  const error = requestError(err.status, err.message);
  if (err.status === 400) error.errors = err.errors.map((e) => ({ messages: e.messages }));
  res.status(err.status).json(error);
});

module.exports = app;
