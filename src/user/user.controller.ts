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
  const response = await PSN
    .FetchUserProfile(ctx.params.user_id)

  ctx.body = response;
});


router.get('/:user_id/games', async (ctx: Koa.Context) => {
  const response = await PSN
    .FetchUserGames(ctx.params.user_id)

  ctx.body = response;
});

router.get('/:user_id/trophies', async (ctx: Koa.Context) => {
  const response = await PSN
    .FetchUserTrophies(ctx.params.user_id)

  ctx.body = response;
});

export default router;