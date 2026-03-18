const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssue,
  updateStatus,
  upvoteIssue,
  addComment,
  getUserIssues
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getIssues)
  .post(protect, upload.array('images', 5), createIssue);

router.get('/user/me', protect, getUserIssues);

router.route('/:id')
  .get(getIssue);

router.put('/:id/status', protect, authorize('official', 'admin'), updateStatus);
router.post('/:id/upvote', protect, upvoteIssue);
router.post('/:id/comments', protect, addComment);

module.exports = router;