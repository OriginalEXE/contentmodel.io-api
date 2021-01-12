import * as z from 'zod';

import contentTypePositionSchema from './contentTypePosition';

const contentModelPositionSchema = z.object({
  contentTypes: z.record(contentTypePositionSchema),
});

export default contentModelPositionSchema;
