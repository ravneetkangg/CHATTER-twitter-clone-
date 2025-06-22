import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import Tweet from '../Tweet';
import axios from 'axios';
import './Likes.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Likes = ({ handleLogout }) => {
  const [likedTweets, setLikedTweets] = useState([]);
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    const fetchLikedTweets = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tweets/liked/${user._id}`);
        setLikedTweets(response.data || []);
      } catch (error) {
        console.error("Error fetching liked tweets:", error);
      }
    };

    fetchLikedTweets();
  }, [user]);

  return (
    <>
      <Navbar handleLogout={handleLogout} />
      <div className="main-container">
        <div className="tweets-container">
          <h2 className="likes-heading">Liked Tweets</h2>
          {likedTweets.length > 0 ? (
            likedTweets.map((tweet, index) => (
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
            <p className="no-likes-message">You haven’t liked any tweets yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Likes;
