import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum Gender {
  male,
  female,
}

registerEnumType(Gender, { name: 'Gender' });

@Entity()
@ObjectType()
export class Sheep {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @Field(type => ID)
  public readonly tagId: string;

  @Field(type => Number)
  public readonly yearOfBirth: number;

  @Field(type => Gender)
  public readonly gender: Gender;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public name?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public race?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public pasture?: string;

  @Field(type => Sheep, { nullable: true })
  @ManyToOne(type => Sheep, { nullable: true })
  public mother: Sheep;

  @Column({ nullable: true })
  public motherId: number;

  @Field(type => Sheep, { nullable: true })
  @ManyToOne(type => Sheep, { nullable: true })
  public father: Sheep;

  @Column({ nullable: true })
  public fatherId: number;

  @Column({ nullable: true })
  public userId: string;
}
