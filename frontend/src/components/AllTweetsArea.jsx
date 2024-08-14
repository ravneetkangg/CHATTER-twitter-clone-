import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllTweetsArea.css';
import Tweet from './Tweet';

const AllTweetsArea = ({ handlePostTweet }) => {
    const [array, setArray] = useState([]);

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const response = await axios.get('http://localhost:4900/api/tweets/tweets');
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
                    />
                ))
            ) : (
                <p>No tweets available</p>
            )}
        </>
    );
};

export default AllTweetsArea;
