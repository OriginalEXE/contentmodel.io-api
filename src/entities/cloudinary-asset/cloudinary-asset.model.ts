import { Field, ObjectType } from '@nestjs/graphql';

import { Model } from '../../models/model';
import { User } from '../user/user.model';

@ObjectType()
export class CloudinaryAsset extends Model {
  @Field(() => String)
  public_id: string;

  @Field(() => Number)
  version: number;

  @Field(() => String)
  signature: string;

  @Field(() => Number, { nullable: true })
  width: number;

  @Field(() => Number, { nullable: true })
  height: number;

  @Field(() => String)
  resource_type: string;

  @Field(() => String)
  type: string;
}
