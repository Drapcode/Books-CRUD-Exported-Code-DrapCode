import express from 'express';

import { pageContent as DefaultPage } from '../page/home.controller';
import { pageContent as PageNotFound } from '../page/404.controller';
import { pageContent as AddNewBook } from '../page/add-new-book.controller';
import { pageContent as EditBook } from '../page/edit-book.controller';
import { pageContent as Dashboard } from '../page/dashboard.controller';

const applicationRoute = express.Router();

// Default Page
applicationRoute.get('/', DefaultPage);

/**
 * 404 Page Related Route
 */
applicationRoute.get('/404', PageNotFound);
applicationRoute.get('/404/:collectionName/:itemId?', PageNotFound);
applicationRoute.get('/:pageName/404/', PageNotFound);
applicationRoute.get('/:pageName/404/:collectionName/:itemId?', PageNotFound);

/**
 * Add New Book Page Related Route
 */
applicationRoute.get('/add-new-book', AddNewBook);
applicationRoute.get('/add-new-book/:collectionName/:itemId?', AddNewBook);
applicationRoute.get('/:pageName/add-new-book/', AddNewBook);
applicationRoute.get('/:pageName/add-new-book/:collectionName/:itemId?', AddNewBook);

/**
 * Edit Book Page Related Route
 */
applicationRoute.get('/edit-book', EditBook);
applicationRoute.get('/edit-book/:collectionName/:itemId?', EditBook);
applicationRoute.get('/:pageName/edit-book/', EditBook);
applicationRoute.get('/:pageName/edit-book/:collectionName/:itemId?', EditBook);

/**
 * Dashboard Page Related Route
 */
applicationRoute.get('/dashboard', Dashboard);
applicationRoute.get('/dashboard/:collectionName/:itemId?', Dashboard);
applicationRoute.get('/:pageName/dashboard/', Dashboard);
applicationRoute.get('/:pageName/dashboard/:collectionName/:itemId?', Dashboard);

export default applicationRoute;
