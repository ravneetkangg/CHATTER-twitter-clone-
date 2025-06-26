import React, { useEffect, useState } from 'react';
import Tweet from '../Tweet';
import axios from 'axios';
import './Likes.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Saved = () => {
  const [savedTweets, setSavedTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    const fetchSavedTweets = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tweets/saved/${user._id}`);
        setSavedTweets(response.data || []);
      } catch (error) {
        console.error("Error fetching saved tweets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedTweets();
  }, [user]);

  return (
    <>
      <div className="tweets-container">
        {loading ? (
          <p className="loading">Loading saved tweets...</p>
        ) : savedTweets.length > 0 ? (
          savedTweets.map(tweet => (
            <Tweet
              key={tweet._id}
              tweet={tweet.tweet}
              user={tweet.email?.email}
              user_id={tweet.email?._id}
              tweetedAt={tweet.createdAt}
              tweet_id={tweet._id}
              likes={tweet.likes || []}
              saved={tweet.saved || []}
              comments={tweet.comments || []}
            />
          ))
        ) : (
          <p className="no-likes-message">You haven’t saved any tweets yet.</p>
        )}
      </div>
    </>
  );
};

export default Saved;
