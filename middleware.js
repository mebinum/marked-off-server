function logErrors (err, req, res, next) {
  console.error("====logging error====");
  console.error(err.stack);
  next(err)
}

function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).json({ error: err })
  } else {
    next(err)
  }
}

function errorHandler (err, req, res, next) {
  res.status(500);
  res.json({ error: err });
}

function allowCors (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}

module.exports =  {
  logErrors,
  clientErrorHandler,
  errorHandler,
  allowCors
};