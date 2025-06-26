import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Tweet.css';
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegBookmark, FaBookmark, FaRegComment, FaTrashAlt } from "react-icons/fa";
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Accessibility setup

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const Tweet = ({ tweet, user, tweetedAt, user_id, tweet_id, likes = [], comments = [], saved = [], imageUrl }) => {
  const [liked, setLiked] = useState(false);
  const [savedTweet, setSavedTweet] = useState(false);
  const [likeCount, setLikeCount] = useState(likes.length);
  const [commentCount] = useState(comments.length);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userInfo = JSON.parse(sessionStorage.getItem('user'));
  const currentUserId = userInfo?._id;

  const navigate = useNavigate();

  useEffect(() => {
    setLiked(likes.some(like => like.user.toString() === currentUserId));
    setSavedTweet(saved.some(save => save.user.toString() === currentUserId));
  }, [likes, saved, currentUserId]);

  const handleLike = async () => {
    try {
      if (!currentUserId) return;

      const url = liked
        ? `${API_BASE_URL}/api/tweets/unlike/${tweet_id}`
        : `${API_BASE_URL}/api/tweets/like/${tweet_id}`;

      await axios.put(url, { userId: currentUserId });
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (!currentUserId) return;

      const url = savedTweet
        ? `${API_BASE_URL}/api/tweets/unsave/${tweet_id}`
        : `${API_BASE_URL}/api/tweets/save/${tweet_id}`;

      await axios.put(url, { userId: currentUserId });
      setSavedTweet(!savedTweet);
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this tweet?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/tweets/delete/${tweet_id}`, {
        data: { userId: currentUserId }
      });

      alert("Tweet deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting tweet:", error);
      alert("Failed to delete tweet");
    }
  };

  const handleViewComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tweets/comments/${tweet_id}`);
      setCommentsList(response.data.comments || []);
      setShowComments(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
      alert("Could not fetch comments.");
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await axios.post(`${API_BASE_URL}/api/tweets/comment/${tweet_id}`, {
        userId: currentUserId,
        comment: newComment.trim(),
      });
      setNewComment(""); // Clear textarea

      // Refresh comments
      const response = await axios.get(`${API_BASE_URL}/api/tweets/comments/${tweet_id}`);
      setCommentsList(response.data.comments || []); // ✅ Fix here
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const goToProfile = () => {
    navigate(`/user/${encodeURIComponent(user)}`);
  };

  const profilePicUrl = `https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${user_id}.jpeg`;

  return (
    <>
      <div className="tweet-card">
        <div className="tweet-user-info">
          <img
            src={profilePicUrl}
            alt="User avatar"
            className="tweet-user-avatar"
            onClick={goToProfile}
            style={{ cursor: 'pointer' }}
          />
          <div className="tweet-user-details">
            <span className="tweet-user-name" onClick={goToProfile} style={{ cursor: 'pointer' }}>
              {user}
            </span>
            <span className="tweet-time">{formatDate(tweetedAt)}</span>
          </div>
          {currentUserId === user_id && (
            <FaTrashAlt
              className="delete-icon"
              onClick={handleDelete}
              title="Delete Tweet"
            />
          )}
        </div>

        <div className="tweet-content">{tweet}</div>
        {imageUrl && (
          <div className="tweet-image-container">
            <img src={imageUrl} alt="Tweet visual" className="tweet-image" />
          </div>
        )}


        <div className="tweet-reactions">
          <div className="reaction-group" onClick={handleLike}>
            {liked ? <FcLike className="like-button" /> : <FcLikePlaceholder className="like-button" />}
            <span className="reaction-count">{likeCount}</span>
          </div>

          <div className="reaction-group" onClick={handleViewComments}>
            <FaRegComment className="comment-button" />
            <span className="reaction-count">{commentCount}</span>
          </div>

          <div className="reaction-group" onClick={handleSave}>
            {savedTweet ? <FaBookmark className="save-button" /> : <FaRegBookmark className="save-button" />}
          </div>
        </div>
      </div>


      <Modal
        isOpen={showComments}
        onRequestClose={() => setShowComments(false)}
        className="comment-modal"
        overlayClassName="comment-modal-overlay"
      >
        {/* Close button top right */}
        <button className="modal-close-button" onClick={() => setShowComments(false)}>
          ❌
        </button>

        {/* === Highlighted Main Tweet === */}
        <div className="modal-tweet">
          <div className="modal-tweet-header">
            <img src={profilePicUrl} className="modal-user-avatar" alt="User avatar" />
            <div>
              <div className="modal-username">{user}</div>
              <div className="modal-time">{formatDate(tweetedAt)}</div>
            </div>
          </div>
          <div className="modal-tweet-content">{tweet}</div>
          {imageUrl && (
            <div className="modal-tweet-image-container">
              <img src={imageUrl} alt="Tweet visual" className="modal-tweet-image" />
            </div>
          )}
        </div>

        <div className="comment-input-container">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            rows={3}
            className="comment-textarea"
          ></textarea>
          <button
            onClick={handlePostComment}
            disabled={isSubmitting}
            className="post-comment-btn"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </div>

        {/* === Comment Thread === */}
        <div className="comment-thread">
          {commentsList.length > 0 ? (
            commentsList.map((c, index) => (
              <div key={index} className="single-comment">
                <div className="comment-header">
                  <img
                    src={`https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${c.user._id}.jpeg`}
                    className="comment-user-avatar"
                    alt="User avatar"
                  />
                  <div>
                    <div className="comment-username">{c.user.email}</div>
                    <div className="comment-time">{formatDate(c.createdAt)}</div>
                  </div>
                </div>
                <div className="modal-tweet-content">{c.comment}</div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No comments yet.</p>
          )}
        </div>
      </Modal>

    </>
  );
};

export default Tweet;
