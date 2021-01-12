import { Field, ObjectType, Int } from '@nestjs/graphql';

import { ContentModel } from './content-model.model';

@ObjectType()
class PaginationInfo {
  @Field(() => Boolean)
  hasNext: boolean;

  @Field(() => Boolean)
  hasPrev: boolean;

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class PaginatedContentModel {
  @Field(() => [ContentModel])
  items: ContentModel[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
