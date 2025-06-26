import React, { useEffect, useState } from 'react';
import Tweet from '../Tweet';
import axios from 'axios';
import './Likes.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserTweets = ({ userId }) => {
  const [userTweets, setUserTweets] = useState([]);

  useEffect(() => {
    const fetchUserTweets = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tweets/posted/${userId}`);
        setUserTweets(response.data || []);
      } catch (error) {
        console.error("Error fetching user's tweets:", error);
      }
    };

    if (userId) {
      fetchUserTweets();
    }
  }, [userId]);

  return (
    <div className="tweets-container">
      {userTweets.length > 0 ? (
        userTweets.map((tweet, index) => (
          <Tweet
            key={index}
            tweet={tweet.tweet}
            user={tweet.email.email}
            user_id={tweet.email._id}
            tweetedAt={tweet.createdAt}
            tweet_id={tweet._id}
            likes={tweet.likes || []}
            saved={tweet.saved || []}
            comments={tweet.comments || []}
          />
        ))
      ) : (
        <p className="no-likes-message">No tweets yet.</p>
      )}
    </div>
  );
};

export default UserTweets;
