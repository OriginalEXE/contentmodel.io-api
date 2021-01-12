import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field() email: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) picture?: string;
}
