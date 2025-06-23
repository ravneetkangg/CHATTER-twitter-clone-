import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Tweet.css';
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegBookmark, FaRegComment } from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const Tweet = ({ tweet, user, tweetedAt, user_id, tweet_id, likes = [], comments = [] }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes.length);
  const [commentCount] = useState(comments.length);

  const userInfo = JSON.parse(sessionStorage.getItem('user'));
  const currentUserId = userInfo?._id;

  useEffect(() => {
    setLiked(likes.includes(currentUserId));
  }, [likes, currentUserId]);

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

  const profilePicUrl = `https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${user_id}.jpeg`;

  return (
    <div className="tweet-card">
      <div className="tweet-user-info">
        <img src={profilePicUrl} alt="User avatar" className="tweet-user-avatar" />
        <div className="tweet-user-details">
          <span className="tweet-user-name">{user}</span>
          <span className="tweet-time">{formatDate(tweetedAt)}</span>
        </div>
      </div>

      <div className="tweet-content">{tweet}</div>

      <div className="tweet-reactions">
        <div className="reaction-group" onClick={handleLike}>
          {liked ? <FcLike className="like-button" /> : <FcLikePlaceholder className="like-button" />}
          <span className="reaction-count">{likeCount}</span>
        </div>

        <div className="reaction-group">
          <FaRegComment className="comment-button" />
          <span className="reaction-count">{commentCount}</span>
        </div>

        <div className="reaction-group">
          <FaRegBookmark className="save-button" />
        </div>
      </div>
    </div>
  );
};

export default Tweet;
