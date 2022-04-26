import * as Koa from 'koa';
import * as Router from 'koa-router';

import * as PSN from '../psn/psn.controller';

const routerOpts: Router.IRouterOptions = {
  prefix: '/game',
};

const router: Router = new Router(routerOpts);

router.get('/', async (ctx: Koa.Context) => {
  ctx.body = { debug: 'user' }
});

router.get('/:game_id', async (ctx: Koa.Context) => {
  const response = await PSN
    .FetchGameTrophyGroups(ctx.params.game_id, String(ctx.query.lang))

  ctx.body = response;
});

router.get('/:game_id/trophies', async (ctx: Koa.Context) => {
  const response = await PSN
    .FetchGameTrophies(ctx.params.game_id, String(ctx.query.lang))

  ctx.body = response;
});

export default router;