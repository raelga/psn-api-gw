import * as Koa from 'koa';
import * as HttpStatus from 'http-status-codes';
import healthzController from '../healthz/healthz.controller';
import userController from '../user/user.controller';

const app: Koa = new Koa();

// Logger
const logger = require('koa-logger')
app.use(logger())

// Generic error handling middleware.
app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
  try {
    await next();
  } catch (error) {
    ctx.status = error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR;
    error.status = ctx.status;
    ctx.body = { error };
    ctx.app.emit('error', error, ctx);
  }
});

// Route middleware.
app.use(healthzController.routes());
app.use(healthzController.allowedMethods());
app.use(userController.routes());
app.use(userController.allowedMethods());

// Application error logging.
app.on('error', console.error);

export default app;