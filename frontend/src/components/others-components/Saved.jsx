import React, { useState } from 'react';
import Tweet from '../Tweet';
import './Likes.css';

const Saved = () => {
  const [savedTweets] = useState([]); // default empty array

  return (
    <>
      <div className="tweets-container">
        {savedTweets.length > 0 ? (
          savedTweets.map((tweet, index) => (
            <Tweet
              key={index}
              tweet={tweet.tweet}
              user={tweet.email.email}
              user_id={tweet.email._id}
              tweetedAt={tweet.createdAt}
              tweet_id={tweet._id}
              likes={tweet.likes || []}
              comments={tweet.comments || []}
            />
          ))
        ) : (
          <p className="no-likes-message">
            Feature in progress
          </p>
        )}
      </div>
    </>
  );
};

export default Saved;
