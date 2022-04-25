import * as Koa from 'koa';
import * as Router from 'koa-router';

import * as PSN from '../psn/psn.controller';

const routerOpts: Router.IRouterOptions = {
  prefix: '/user',
};

const router: Router = new Router(routerOpts);

router.get('/', async (ctx: Koa.Context) => {
  ctx.body = { debug: 'user' }
});

router.get('/:user_id', async (ctx: Koa.Context) => {
  const user_profile = await PSN
    .FetchUserProfile(ctx.params.user_id)

  ctx.body = user_profile;
});

export default router;