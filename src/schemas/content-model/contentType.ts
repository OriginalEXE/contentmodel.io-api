import * as z from 'zod';

import contentTypeFieldSchema from './contentTypeField';
import sysSchema from './sys';

const contentTypeSchema = z.object({
  sys: sysSchema,
  name: z.string(),
  displayField: z.nullable(z.string()),
  description: z.nullable(z.string()),
  fields: z.array(contentTypeFieldSchema),
  internal: z.optional(z.boolean()),
});

export default contentTypeSchema;
