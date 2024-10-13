require('dotenv').config();

const express = require('express');
const configViewEngine = require('./src/config/viewEngine')
const musicListRoutes = require('./src/routes/route_name')
const app = express();
const port = process.env.PORT;

configViewEngine(app);

app.use('/', musicListRoutes);

app.listen(port, () => {
    console.log('Example app listening on port:', port);
})