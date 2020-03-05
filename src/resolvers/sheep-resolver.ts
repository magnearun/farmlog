import {
  RelayedQuery,
  RelayLimitOffset,
  RelayLimitOffsetArgs,
} from 'auto-relay';
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { FindConditions, Raw, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Gender, Sheep } from '../entities/sheep';
import { User } from '../entities/user';
import { SheepInput } from '../types/inputs/sheep-input';
import { Context } from '../types/interfaces/Context';
import { Authorized } from '../utils/authorized';
@Resolver(of => Sheep)
export class SheepResolver {
  constructor(
    @InjectRepository(Sheep)
    private readonly sheepRepository: Repository<Sheep>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Authorized()
  @Query(returns => Sheep, { nullable: true })
  public sheep(@Arg('sheepId', type => Int) sheepId: number) {
    return this.sheepRepository.findOne(sheepId);
  }

  @RelayedQuery(() => Sheep)
  public async sheeps(
    @Ctx() { userId }: Context,
    @RelayLimitOffset() { limit, offset }: RelayLimitOffsetArgs
  ): Promise<[Sheep[], number]> {
    return this.sheepRepository.findAndCount({
      where: {
        userId,
      },
      skip: offset,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  @RelayedQuery(() => Sheep)
  public async rams(
    @Ctx() { userId }: Context,
    @RelayLimitOffset() { limit, offset }: RelayLimitOffsetArgs,
    @Arg('query') query?: string
  ): Promise<[Sheep[], number]> {
    const where = {
      userId,
      gender: Gender.male,
    } as FindConditions<Sheep>;

    return this.sheepRepository.findAndCount({
      where: [
        {
          ...where,
          name: Raw((alias: any) => `${alias} ILIKE '%${query}%'`),
        },
        {
          ...where,
          tag: Raw((alias: any) => `${alias} ILIKE '%${query}%'`),
        },
      ],
      skip: offset,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  @Authorized()
  @Mutation(returns => Sheep)
  public async addSheep(
    @Arg('sheep') sheepInput: SheepInput,
    @Ctx() { userId }: Context
  ): Promise<Sheep | undefined> {
    const sheep = this.sheepRepository.create({
      ...sheepInput,
      userId,
    });

    return await this.sheepRepository.save(sheep);
  }

  @FieldResolver()
  public async mother(@Root() sheep: Sheep): Promise<Sheep> {
    return (await this.sheepRepository.findOneOrFail(sheep.motherId, {
      cache: 1000,
    }))!;
  }
}
