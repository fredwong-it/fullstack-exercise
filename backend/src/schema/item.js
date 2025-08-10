const { z } = require('zod');

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().nonnegative('Price must be >= 0'),
});

module.exports = { itemSchema };