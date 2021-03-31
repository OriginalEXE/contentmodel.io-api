import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UnstarContentModelInput {
  @Field() id: string;
}
