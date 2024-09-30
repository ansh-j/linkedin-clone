import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js'
import { getFeedPosts, createPost, deletePost, getPostByid, createComment, likePost  } from '../controllers/post.controller.js';

const router = express.Router();

router.get('/', protectRoute, getFeedPosts);
router.post('/create', protectRoute, createPost);
router.delete('/delete/:id', protectRoute, deletePost);
router.get('/:id', protectRoute, getPostByid);
router.post('/:id/comment', protectRoute, createComment);
router.post('/:id/like', protectRoute,likePost);

export default router;