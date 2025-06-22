import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Tweet.css';
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegBookmark, FaRegComment } from "react-icons/fa";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const formatDate = (dateString) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const Tweet = ({ tweet, user, tweetedAt, user_id, tweet_id, likes = [] }) => {
    const [profilePic, setProfilePic] = useState(null);
    const [liked, setLiked] = useState(false);
    const userInfo = JSON.parse(sessionStorage.getItem('user'));
    const currentUserId = userInfo?._id;

    useEffect(() => {
        // Check if the tweet is liked by current user
        setLiked(likes.includes(currentUserId));
    }, [likes, currentUserId]);

    useEffect(() => {
        const fetchProfilePic = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/users/get-photo/${user_id}`, {
                    responseType: 'arraybuffer'
                });
                const base64Flag = `data:${response.headers['content-type']};base64,`;
                const imageStr = arrayBufferToBase64(response.data);
                setProfilePic(base64Flag + imageStr);
            } catch (error) {
                console.error("Error fetching profile picture:", error);
            }
        };

        fetchProfilePic();
    }, [user_id]);

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const handleLike = async () => {
        try {
            if (!currentUserId) return;

            const url = liked
                ? `${API_BASE_URL}/api/tweets/unlike/${tweet_id}`
                : `${API_BASE_URL}/api/tweets/like/${tweet_id}`;

            await axios.put(url, { userId: currentUserId });

            setLiked(!liked); // toggle local like state
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    return (
        <div className="tweet-card">
            <div className="tweet-user-info">
                {profilePic ? (
                    <img src={profilePic} alt="User avatar" className="tweet-user-avatar" />
                ) : (
                    <div className="tweet-user-avatar">U</div>
                )}
                <div className="tweet-user-details">
                    <span className="tweet-user-name">{user}</span>
                    <span className="tweet-time">{formatDate(tweetedAt)}</span>
                </div>
            </div>
            <div className="tweet-content">{tweet}</div>
            <div className="tweet-reactions">
                {liked ? (
                    <FcLike className='like-button' onClick={handleLike} />
                ) : (
                    <FcLikePlaceholder className='like-button' onClick={handleLike} />
                )}

                <FaRegComment className="comment-button" />
                <FaRegBookmark className='save-button' />
            </div>
        </div>
    );
};

export default Tweet;
