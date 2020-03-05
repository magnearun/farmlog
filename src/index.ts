require('dotenv').config(); // tslint:disable-line no-var-requires
import * as Sentry from '@sentry/node';
import { createServer } from './createServer';
import { log } from './utils/log';

const port = process.env.PORT || 4000;

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

createServer().then(({ app, server }: any) => {
  // Start the server
  app.listen(port, () => {
    log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
    log(
      `🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
    );
  });
});
