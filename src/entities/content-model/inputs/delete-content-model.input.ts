import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DeleteContentModelInput {
  @Field() id: string;
}
