import { Field, ID, ObjectType, registerEnumType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  male,
  female,
}

registerEnumType(Gender, { name: 'Gender' });

@Entity()
@ObjectType()
export class Sheep {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  public id: string;

  @Field(type => String)
  @Column()
  public tag: string;

  @Field(type => Date)
  @Column()
  public dateOfBirth: Date;

  @Field(type => Gender)
  @Column()
  public gender: Gender;

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

  @CreateDateColumn()
  @Field(type => Date)
  public createdAt: Date;

  @UpdateDateColumn()
  @Field(type => Date)
  public updatedAt: Date;
}
