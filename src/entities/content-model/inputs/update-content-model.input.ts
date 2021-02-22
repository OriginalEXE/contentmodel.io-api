import { InputType, Field } from '@nestjs/graphql';

@InputType()
class UpdateContentModelVersionInput {
  @Field({ nullable: true }) model?: string;
  @Field({ nullable: true }) position?: string;
}

@InputType()
export class UpdateContentModelInput {
  @Field() id: string;
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) visibility?: string;
  @Field({ nullable: true }) version?: UpdateContentModelVersionInput;
}
