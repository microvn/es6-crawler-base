import express from 'express';
import logger from 'morgan';
import http from 'http';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import * as authMiddle from './modules/auth/middleware';
import routes from './modules/routes';
import wsController from './modules/websocket';
import cors from 'cors';
import socketIO from 'socket.io';
import swagger from 'express-swagger-generator';
import configs from './config';

const app = express();
const server = http.createServer(app);


//
// app.use(function (req, res, next) {
//     res.io = io;
//     next();
// });
app.use(logger('common', { skip: (req, res) => res.statusCode < 400 }));
//app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(authMiddle.init());


// Document API
swagger(app)(configs.generator);

// Group Event On Socket
// wsController(socketIO.listen(server));

// Group Routes API
app.use('/api', routes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  res.send({
    message: err.message,
    error: err.status,
  });
});


export { app, server };
