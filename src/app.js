const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const rollbarModule = require("rollbar");

const indexRouter = require('./routes');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');
const cors = require("cors");

// const rollbar = new rollbarModule({
//   accessToken: "3d148bed26fe450f81906754502c44e8",
//   captureUncaught: true,
//   captureUnhandledRejections: true});
// global.rollbar = rollbar;
//
const corsOptions = {
  'credentials': true,
  'origin': true,
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'allowedHeaders': 'Authorization,X-Requested-With,X-HTTPMethod-Override,Content-Type,Cache-Control,Accept',
}

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');

app.use(cors(corsOptions));
app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
