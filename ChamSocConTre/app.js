var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var taikhoanRouter = require('./routes/taikhoanCtl');
var adminRouter = require('./routes/adminRoutes');
var userRouter = require('./routes/userRoutes');
var capnhatthongtinRouter = require('./routes/capnhatthongtinCtrl');
var danhsachbaivietRouter = require('./routes/danhsachbaivietCtrl');
var chitietbaivietRouter = require('./routes/chitietbaivietCtrl');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/taikhoan', taikhoanRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/capnhatthongtin', capnhatthongtinRouter);
app.use('/danhsachbaiviet', danhsachbaivietRouter);
app.use('/chitietbaiviet', chitietbaivietRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('file404');
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
