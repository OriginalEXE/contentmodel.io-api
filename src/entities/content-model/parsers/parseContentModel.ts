import * as z from 'zod';

import contentModelSchema from '../../../schemas/content-model/contentModel';

const parseContentModel = (
  input: unknown,
):
  | { success: false; error: Error }
  | { success: true; data: z.infer<typeof contentModelSchema> } => {
  try {
    const inputAsObject =
      typeof input === 'string' ? JSON.parse(input.trim()) : input;

    return contentModelSchema.safeParse(inputAsObject);
  } catch (e) {
    return { success: false, error: e };
  }
};

export default parseContentModel;
