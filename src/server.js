//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql");
var app = express();
const config = require('./config.json');
const endpointGenerator = require('./endpointGenerator.js');

// Body Parser Middleware
app.use(bodyParser.json());
app.enable('trust proxy')

//CORS Middleware
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
});

app.use(
  (req, res, next) => {
    let date = new Date();
    console.log(`[${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}][${req.connection?.remoteAddress?.split(':').pop()}] ${req.originalUrl}`)
    next();
  }
)

// runs queries through database connection pool:
const executeQuery = function(query, callback) {
  let request = pool.request();
  request.query(query, callback);
}

// generates Api endpoints for tables:
const registerEndpoints = function(tables, executeQuery) {
  if (tables && tables.length) tables.map(
    (table) => {
      endpointGenerator.generateEndpoints(app, table, executeQuery, '/api/');
      console.log(`[+] Added endpoint for "${table}": /api/${table}`);
    }
  );
}

// stablishing databse connection pool:
console.log(`Connecting to database "${config?.connection?.database}"...`);
var pool;
new sql.ConnectionPool(config.connection)
  .connect()
  .then(
    _pool => {
      pool = _pool
      console.log(`Connected to database "${pool.config.database}" on server ${pool.config.server}:${pool.config.port}`);
      // registering endpoints:
      registerEndpoints(config?.api?.tables, executeQuery);
      // Starting Api server:
      var server = app.listen(
        config?.service?.port || 8080,
        () => { console.log(`\nSql2Api listenning on ${server.address().port}\n\n`) }
      );
    }
  ).catch(
    err => {
      console.log(`[!!!] Error connecting to database!`);
      console.log(err);
    }
  );
