import { Field, ObjectType } from '@nestjs/graphql';

import { Model } from '../../models/model';
import { User } from '../user/user.model';

@ObjectType()
export class Login extends Model {
  @Field(() => String)
  auth0Id: string;

  @Field({ nullable: true })
  fresh?: boolean;

  @Field(() => User)
  user?: User;
}
