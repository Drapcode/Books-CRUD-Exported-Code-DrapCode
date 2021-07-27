import express from 'express';
import {
  findOneItem,
  productFilterItemCount,
  productFilterItems,
  createItem,
  deleteItem,
} from './new_books.controller';

const router = express.Router();

router.get('/collection-table/new_books/item/:itemId', findOneItem);
router.get('/collection-table/new_books/finder/:filterId/items/', productFilterItems);
router.get('/collection-table/new_books/finder/:filterId/items/count', productFilterItemCount);

// 3
router.delete('/open/collection-form/:collectionName/items/:itemId', deleteItem);
router.post('/open/collection-form/:collectionName/items/constructor/:constructorId?', createItem);

export default router;
