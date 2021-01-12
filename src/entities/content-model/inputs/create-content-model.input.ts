import { InputType, Field } from '@nestjs/graphql';

@InputType()
class CreateContentModelVersionInput {
  @Field() model: string;
  @Field() position: string;
}

@InputType()
export class CreateContentModelInput {
  @Field() title: string;
  @Field() description: string;
  @Field() version: CreateContentModelVersionInput;
}
