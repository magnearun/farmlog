import { RelayNbOfItems } from 'auto-relay';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType({ isAbstract: true })
export class BaseRelayConnection {
  @Field(() => Int)
  public totalCount(@RelayNbOfItems() nbOfItems: number): number {
    return nbOfItems;
  }
}
