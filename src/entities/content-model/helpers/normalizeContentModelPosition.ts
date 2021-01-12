import * as z from 'zod';

import contentModelPositionSchema from '../../../schemas/diagram/contentModelPosition';

const normalizeContentModelPosition = (
  contentModelPosition: z.infer<typeof contentModelPositionSchema>,
): z.infer<typeof contentModelPositionSchema> => {
  let smallestX: number;
  let smallestY: number;

  Object.values(contentModelPosition.contentTypes).forEach((position) => {
    if (smallestX === undefined || position.x < smallestX) {
      smallestX = position.x;
    }

    if (smallestY === undefined || position.y < smallestY) {
      smallestY = position.y;
    }
  });

  return {
    ...contentModelPosition,
    contentTypes: Object.keys(contentModelPosition.contentTypes).reduce(
      (positions, contentTypeId) => {
        const position = contentModelPosition.contentTypes[contentTypeId];

        return {
          ...positions,
          [contentTypeId]: {
            x: position.x - smallestX,
            y: position.y - smallestY,
          },
        };
      },
      {},
    ),
  };
};

export default normalizeContentModelPosition;
