const helmet = require('helmet');
const cors = require('cors');
const express = require('express');

const app = express();

// For parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// For securing app by setting various HTTP headers
app.use(helmet());

// For enabling CORS
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
