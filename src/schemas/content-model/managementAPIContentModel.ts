import * as z from 'zod';

import contentModelSchema from './contentModel';

const managementAPIContentModelSchema = z.object({
  items: contentModelSchema,
});

export default managementAPIContentModelSchema;
