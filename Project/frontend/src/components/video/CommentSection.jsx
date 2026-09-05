import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commentService } from '../../services/comment.service';
import { likeService } from '../../services/like.service';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { formatTimeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CommentSection = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await commentService.getVideoComments(videoId, 1, 30);
      setComments(response.data?.docs || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setSubmitting(true);
    try {
      const response = await commentService.addComment(videoId, newComment.trim());
      setComments((prev) => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like comments');
      return;
    }
    try {
      await likeService.toggleCommentLike(commentId);
      loadComments();
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold text-youtube-text mb-5">
        {comments.length.toLocaleString()} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-3">
            <Avatar
              src={user?.avatar}
              alt={user?.fullName}
              fallback={user?.fullName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-transparent border-b border-youtube-border px-0 py-2 text-youtube-text placeholder-youtube-text-secondary focus:outline-none focus:border-youtube-text resize-none transition-colors"
                rows="1"
              />
              <div className="flex gap-2 mt-2 justify-end opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewComment('')}
                  disabled={!newComment.trim() || submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  disabled={!newComment.trim()}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="card-surface mb-8 text-center py-5">
          <p className="text-sm text-youtube-text-secondary">
            <Link to="/login" className="text-blue-400 hover:underline font-medium">
              Sign in
            </Link>{' '}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader size="md" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-youtube-text-secondary text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <Link to={`/channel/${comment.owner?._id}`} className="flex-shrink-0">
                <Avatar
                  src={comment.owner?.avatar}
                  alt={comment.owner?.fullName}
                  fallback={comment.owner?.fullName || 'User'}
                  size="sm"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Link
                    to={`/channel/${comment.owner?._id}`}
                    className="font-semibold text-sm text-youtube-text hover:text-youtube-text-secondary transition-colors"
                  >
                    {comment.owner?.fullName || 'Unknown'}
                  </Link>
                  <span className="text-xs text-youtube-text-secondary">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-youtube-text text-sm mb-2 break-words">{comment.content}</p>
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className="flex items-center gap-1.5 text-xs text-youtube-text-secondary hover:text-youtube-text transition-colors"
                    disabled={!isAuthenticated}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {comment.likesCount || 0}
                  </button>

                  {user?._id === comment.owner?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="flex items-center gap-1.5 text-xs text-youtube-text-secondary hover:text-youtube-red transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;