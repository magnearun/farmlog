import { Field, InputType } from 'type-graphql';
import { Gender, Sheep } from '../../entities/sheep';

@InputType()
export class SheepInput implements Partial<Sheep> {
  @Field()
  public tag: string;

  @Field()
  public dateOfBirth: Date;

  @Field(type => Gender)
  public gender: Gender;

  @Field({ nullable: true })
  public name?: string;

  @Field({ nullable: true })
  public race?: string;

  @Field({ nullable: true })
  public pasture?: string;

  @Field({ nullable: true })
  public motherId?: number;

  @Field({ nullable: true })
  public fatherId?: number;
}
