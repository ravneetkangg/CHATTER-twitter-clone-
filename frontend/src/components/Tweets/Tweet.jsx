import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Tweet.css';
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegBookmark, FaBookmark, FaRegComment, FaTrashAlt } from "react-icons/fa";
import CommentModal from './CommentModal';

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
  const [showImageModal, setShowImageModal] = useState(false);

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
        ? `${API_BASE_URL}/api/likes/unlike/${tweet_id}`
        : `${API_BASE_URL}/api/likes/like/${tweet_id}`;

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
            <img
              src={imageUrl}
              alt="Tweet visual"
              className="tweet-image"
              onClick={() => setShowImageModal(true)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        )}

        <div className="tweet-reactions">
          <div className="reaction-group" onClick={handleLike}>
            {liked ? <FcLike className="like-button" /> : <FcLikePlaceholder className="like-button" />}
            <span className="reaction-count">{likeCount}</span>
          </div>

          <div className="reaction-group" onClick={() => setShowComments(true)}>
            <FaRegComment className="comment-button" />
            <span className="reaction-count">{commentCount}</span>
          </div>

          <div className="reaction-group" onClick={handleSave}>
            {savedTweet ? <FaBookmark className="save-button" /> : <FaRegBookmark className="save-button" />}
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={showComments}
        onRequestClose={() => setShowComments(false)}
        tweetId={tweet_id}
        currentUserId={currentUserId}
        profilePicUrl={profilePicUrl}
        tweet={tweet}
        tweetedAt={tweetedAt}
        user={user}
        imageUrl={imageUrl}
        apiBaseUrl={API_BASE_URL}
      />

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt="Full size tweet" className="modal-full-image" />
            <button className="modal-close-button" onClick={() => setShowImageModal(false)}> ❌</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Tweet;
