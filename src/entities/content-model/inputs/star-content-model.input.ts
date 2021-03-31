import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class StarContentModelInput {
  @Field() id: string;
}
