import * as z from 'zod';

import contentModelSchema from './contentModel';

const deliveryAPIContentModelSchema = z.object({
  items: contentModelSchema,
});

export default deliveryAPIContentModelSchema;
