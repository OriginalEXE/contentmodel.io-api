import { Field, ObjectType } from '@nestjs/graphql';

import { Model } from '../../models/model';
import { User } from '../user/user.model';

@ObjectType()
export class ContentModel extends Model {
  @Field(() => String)
  cms: string;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => String)
  model: string;

  @Field(() => String)
  position: string;
}
