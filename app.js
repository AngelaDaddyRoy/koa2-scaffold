const Koa = require('koa')
const app = new Koa()
const middleware = require('./middleware') 
const config =require('./config')
middleware(app) 
//record error
app.on('error', function(err) {
    if (process.env.NODE_ENV != 'test') {
      //console.log('sent error %s to the cloud', err.message);
      console.log(err);
    }
  });

app.listen(config.port || process.env.port, function () { console.log(`server starting at ${config.port}`) })