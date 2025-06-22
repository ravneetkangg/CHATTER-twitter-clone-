import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllTweetsArea.css';
import Tweet from './Tweet';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AllTweetsArea = ({ handlePostTweet }) => {
    const [array, setArray] = useState([]);

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/tweets/tweets`);
                setArray(response.data);
            } catch (error) {
                console.error('Error fetching tweets:', error);
            }
        };

        fetchTweets();
    }, [handlePostTweet]);

    return (
        <>
            {array.length > 0 ? (
                array.map((tweet, index) => (
                    <Tweet
                        key={index}
                        tweet={tweet.tweet}
                        user={tweet.email.email}
                        user_id={tweet.email._id}
                        tweetedAt={tweet.createdAt}
                        tweet_id={tweet._id}
                        likes={tweet.likes || []}
                    />
                ))
            ) : (
                <p>No tweets available</p>
            )}
        </>
    );
};

export default AllTweetsArea;
