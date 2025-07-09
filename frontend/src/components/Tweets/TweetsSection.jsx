import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Tweet from './Tweet';
import Spinner from '../Common/Spinner';
import './TweetsSection.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TweetsSection = ({ endpoint, title, emptyMessage = "No tweets here." }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        setTweets(response.data || []);
      } catch (error) {
        console.error("Error fetching tweets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, [endpoint]);

  return (
    <div className="tweet-feed-area">
      {loading ? (
        <Spinner />
      ) : tweets.length > 0 ? (
        tweets.map((tweet, index) => (
          <Tweet
            key={index}
            tweet={tweet.tweet}
            user={tweet.email?.email}
            user_id={tweet.email?._id}
            tweetedAt={tweet.createdAt}
            tweet_id={tweet._id}
            likes={tweet.likes || []}
            saved={tweet.saved || []}
            comments={tweet.comments || []}
            imageUrl={tweet.imageUrl}
          />
        ))
      ) : (
        <p className="no-tweets-message">{emptyMessage}</p>
      )}
    </div>
  );
};

export default TweetsSection;
