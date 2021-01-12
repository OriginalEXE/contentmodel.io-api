import * as z from 'zod';

import sysSchema from './sys';

const contentTypeSysSchema = z.object({
  space: z.object({
    sys: sysSchema,
  }),
  id: z.string(),
  type: z.string(),
});

export default contentTypeSysSchema;
