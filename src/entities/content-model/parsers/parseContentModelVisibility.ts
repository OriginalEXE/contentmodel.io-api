import * as z from 'zod';

export const ContentModelVisibilityEnum = z.enum([
  'PUBLIC',
  'UNLISTED',
  'PRIVATE',
]);

const parseContentModel = (
  input: unknown,
):
  | { success: false; error: Error }
  | { success: true; data: z.infer<typeof ContentModelVisibilityEnum> } => {
  try {
    return ContentModelVisibilityEnum.safeParse(input);
  } catch (e) {
    return { success: false, error: e };
  }
};

export default parseContentModel;
