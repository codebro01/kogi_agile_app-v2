import express from 'express';
import { getSystemControl, updateSystemControl } from '../controllers/systemControlController.js';

const router = express.Router();

router.route('/')
    .get(getSystemControl)
    .put(updateSystemControl);

export default router;
