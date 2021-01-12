import * as z from 'zod';

import contentTypeSchema from './contentType';

const contentModelSchema = z.array(contentTypeSchema);

export default contentModelSchema;
