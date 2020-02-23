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
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Sheep } from '../entities/sheep';
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

  @Authorized()
  @Query(returns => [Sheep])
  public sheeps(): Promise<Sheep[]> {
    return this.sheepRepository.find();
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
