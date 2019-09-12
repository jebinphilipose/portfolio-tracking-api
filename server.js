const app = require('./loaders/express');
const mongoose = require('./loaders/mongoose');

// Connect to MongoDB
mongoose.connect();

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
