import { AccountsModule } from '@accounts/graphql-api';
import { AccountsPassword } from '@accounts/password';
import { AccountsServer } from '@accounts/server';
import { AccountsTypeorm } from '@accounts/typeorm';
import { TypeOrmConnection } from '@auto-relay/typeorm';
import * as Sentry from '@sentry/node';
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import { AutoRelayConfig } from 'auto-relay';
import cors from 'cors';
import express from 'express';
import { GraphQLError } from 'graphql';
import { mergeResolvers, mergeTypeDefs } from 'graphql-toolkit';
import Mailgun from 'mailgun-js';
import 'reflect-metadata';
import { OpenAPI, useSofa } from 'sofa-api';
import swagger from 'swagger-ui-express';
import { buildTypeDefsAndResolvers, ResolverData } from 'type-graphql';
import { Container } from 'typedi';
import * as TypeORM from 'typeorm';
import { Sheep } from './entities/sheep';
import { SheepResolver } from './resolvers/sheep-resolver';
import { UserResolver } from './resolvers/user-resolver';
import { Context } from './types/interfaces/Context';
import { BaseRelayConnection } from './types/objects/BaseRelayConnection';
import { log } from './utils/log';

const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;

console.log({ MAILGUN_API_KEY, MAILGUN_DOMAIN });

// tslint:disable-next-line: no-unused-expression
new AutoRelayConfig({
  orm: () => TypeOrmConnection,
  extends: { connection: () => BaseRelayConnection },
});

let mailgun;

if (MAILGUN_API_KEY && MAILGUN_API_KEY !== '') {
  mailgun = Mailgun({
    apiKey: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN,
  });
}

export async function createServer() {
  TypeORM.useContainer(Container);

  try {
    // create TypeORM connection
    const connection = await TypeORM.createConnection({
      type: 'postgres',
      database: 'magnearun',
      username: 'magnearun', // fill this with your username
      // password: 'magnea90', // and password
      port: 5432,
      host: 'localhost',
      entities: [...require('@accounts/typeorm').entities, Sheep],
      synchronize: true,
      logger: 'advanced-console',
      logging: 'all',
      // dropSchema: true,
      // cache: true,
    });

    const tokenSecret = 'process.env.ACCOUNTS_SECRET' || 'change this in .env';

    const db = new AccountsTypeorm({ connection, cache: 1000 });
    const password = new AccountsPassword();
    const accountsServer = new AccountsServer(
      {
        db,
        tokenSecret,
        siteUrl: 'http://localhost:3000',
        sendMail(mail) {
          if (mailgun) {
            return mailgun.messages().send(mail);
          }
        },
      },
      { password }
    );
    // Creates resolvers, type definitions, and schema directives used by accounts-js
    const accountsGraphQL = AccountsModule.forRoot({
      accountsServer,
    });

    // seed database with some data
    // await seedDatabase();

    log('building schema...', accountsGraphQL.resolvers);

    const s = await buildTypeDefsAndResolvers({
      resolvers: [SheepResolver, UserResolver],
      container: ({ context }: ResolverData<Context>) => context.container,
    });

    const schema = makeExecutableSchema({
      typeDefs: mergeTypeDefs([accountsGraphQL.typeDefs, s.typeDefs]),
      resolvers: mergeResolvers([
        s.resolvers,
        accountsGraphQL.resolvers as any,
      ]),
      schemaDirectives: {
        ...accountsGraphQL.schemaDirectives,
      },
    });

    const openApi = OpenAPI({
      schema,
      info: {
        title: 'Sheep API',
        version: '1.0.0',
      },
    });

    const app = express();
    app.use(cors());
    app.use(
      '/api',
      useSofa({
        schema,
        onRoute(info) {
          openApi.addRoute(info, {
            basePath: '/api',
          });
        },
      })
    );
    app.use('/api', swagger.serve, swagger.setup(openApi.get()));

    const server = new ApolloServer({
      schema,
      introspection: true,
      playground: true,
      uploads: true,
      context: async args => {
        const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const container = Container.of(requestId);
        const ipAddress = args.req
          ? (args.req.headers &&
              (args.req.headers['x-forwarded-for'] as string)) ||
            (args.req.connection && args.req.connection.remoteAddress)
          : '127.0.0.2';

        const { user, authToken, userId } = await accountsGraphQL.context(args);
        const context = {
          user,
          authToken,
          userId,
          requestId,
          container,
          ipAddress,
        };

        container.set('context', context);
        return context;
      },
      formatResponse: (response: any, { context }: ResolverData<Context>) => {
        Sentry.setExtra('identifier', context.requestId);
        Container.reset(context.requestId);
        if (response.errors) {
          response.errors.forEach((error: any) => {
            error.extensions = error.extensions || {};
            error.extensions.requestId = context.requestId;
          });
        }
        return response;
      },
      formatError: (error: GraphQLError) => {
        Sentry.captureException(error);
        return error;
      },
    });

    server.applyMiddleware({ app, cors: { origin: true } });

    return { server, app, schema };
  } catch (err) {
    console.error(err);
  }
}
