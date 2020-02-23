import { AccountsModule } from '@accounts/graphql-api';
import AccountsPassword from '@accounts/password';
import AccountsTypeorm from '@accounts/typeorm';
import GraphQLJSON from 'graphql-type-json';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Context } from 'vm';
import { User } from '../entities/user';
import { Authorized } from '../utils/authorized';

@Resolver(of => User)
export class UserResolver {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Authorized()
  @Query(returns => User, { nullable: true })
  public async me(@Ctx() { userId }: Context): Promise<User | null> {
    if (userId) {
      return this.userRepository.findOneOrFail(userId);
    }
    return null;
  }

  @Mutation(returns => Boolean)
  public async signup(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Arg('profile', type => GraphQLJSON, { nullable: true }) profile: any
  ) {
    const accounts = AccountsModule.injector.get(AccountsPassword);
    const db = accounts.server.options.db as AccountsTypeorm;
    const userId = await accounts.createUser({ email, password });
    await accounts.server.activateUser(userId);
    // if (profile) {
    //   const meta = new UserMeta();
    //   meta.id = userId;
    //   meta.profile = profile;
    //   await getRepository(UserMeta).save(meta);
    // }
    await db.verifyEmail(userId, email);

    return true;
  }
}
