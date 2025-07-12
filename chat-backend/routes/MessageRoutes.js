import express from 'express';
import { getMessages, getUsersForSidebar, markMessagesAsSeen, sendMessage } from '../controllers/MessageController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const messageRouter = express.Router();

messageRouter.get('/users', authMiddleware, getUsersForSidebar); // Get users for sidebar with unseen message counts
messageRouter.get('/:userId', authMiddleware, getMessages); // Get messages with a specific user
messageRouter.put('/seen/:id', authMiddleware, markMessagesAsSeen); // Mark messages as seen
messageRouter.post('/send/:id', authMiddleware, sendMessage); // Send a new message


export default messageRouter;