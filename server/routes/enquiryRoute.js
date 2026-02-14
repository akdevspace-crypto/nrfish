import express from 'express';
import { createEnquiry, getEnquiries, initTable } from '../controllers/enquiryController.js';

const enquiryRouter = express.Router();

enquiryRouter.get('/init', initTable);
enquiryRouter.post('/create', createEnquiry);
enquiryRouter.get('/list', getEnquiries);

export default enquiryRouter;
