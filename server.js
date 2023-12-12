const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

// Import package.json
const application_routes = require('./routes/application_routes');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', application_routes);

// Version endpoint


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
