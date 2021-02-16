import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImageAsset {
  @Field(() => String)
  src: string;

  @Field(() => String)
  path: string;

  @Field(() => Number)
  width: number;

  @Field(() => Number)
  height: number;
}
