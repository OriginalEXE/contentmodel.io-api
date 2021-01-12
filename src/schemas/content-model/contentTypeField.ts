import * as z from 'zod';

import linkEntryValidationSchema from './linkEntryValidation';

const PossibleValidationsSchema = z.record(z.any());

const contentTypeFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  localized: z.boolean(),
  required: z.boolean(),
  disabled: z.boolean(),
  omitted: z.boolean(),
  linkType: z.optional(z.union([z.literal('Asset'), z.literal('Entry')])),
  validations: z.optional(z.array(linkEntryValidationSchema)),
  items: z.optional(
    z.object({
      type: z.string(),
      validations: z.optional(
        z.array(
          z.union([linkEntryValidationSchema, PossibleValidationsSchema]),
        ),
      ),
      linkType: z.optional(z.union([z.literal('Asset'), z.literal('Entry')])),
    }),
  ),
});

export default contentTypeFieldSchema;
