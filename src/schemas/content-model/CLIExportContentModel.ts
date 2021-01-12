import * as z from 'zod';

import contentModelSchema from './contentModel';

const CLIExportContentModelSchema = z.object({
  contentTypes: contentModelSchema,
});

export default CLIExportContentModelSchema;
