import * as Koa from 'koa';
import json = require('koa-json');
import * as Router from 'koa-router';

const routerOpts: Router.IRouterOptions = {
  prefix: '/healthz',
};

const router: Router = new Router(routerOpts);

router.get('/', async (ctx: Koa.Context) => {
  ctx.body = { status: 'ok' }
});

export default router;