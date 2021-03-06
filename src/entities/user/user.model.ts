import { Field, ObjectType } from '@nestjs/graphql';

import { Model } from '../../models/model';

@ObjectType()
export class User extends Model {
  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  contentful_token_read: string;

  @Field(() => String)
  picture: string;
}
