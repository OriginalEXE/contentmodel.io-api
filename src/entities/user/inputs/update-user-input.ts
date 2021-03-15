import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field() id: string;
  @Field({ nullable: true }) contentful_token_read?: string;
  @Field({ nullable: true }) name?: string;
}
