import * as z from 'zod';

import contentModelPositionSchema from '../../../schemas/diagram/contentModelPosition';

const parseContentModelPosition = (
  input: unknown,
):
  | { success: false; error: Error }
  | { success: true; data: z.infer<typeof contentModelPositionSchema> } => {
  try {
    const inputAsObject =
      typeof input === 'string' ? JSON.parse(input.trim()) : input;

    return contentModelPositionSchema.safeParse(inputAsObject);
  } catch (e) {
    return { success: false, error: e };
  }
};

export default parseContentModelPosition;
