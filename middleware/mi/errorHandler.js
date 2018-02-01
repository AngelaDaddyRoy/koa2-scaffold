module.exports = (app)=>{
   app.use(async function(ctx, next) {
        try {
          await next();
        } catch (err) {
          // some errors will have .status
          // however this is not a guarantee
          ctx.status = err.status || 500;
          ctx.type = 'json';
          ctx.body = 'Something exploded, please contact jnmcluo@163.com';
      
          // since we handled this manually we'll
          // want to delegate to the regular app
          // level error handling as well so that
          // centralized still functions correctly.
          ctx.app.emit('error', err, ctx);
        }
      })
}