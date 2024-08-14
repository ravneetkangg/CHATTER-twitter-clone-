import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Tweet.css';
// import { FcLike } from "react-icons/fc";
import { FcLikePlaceholder } from "react-icons/fc";
import { FaRegBookmark } from "react-icons/fa";
// import { FaBookmark } from "react-icons/fa";



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

const Tweet = ({ tweet, user, tweetedAt, user_id }) => {
    const [profilePic, setProfilePic] = useState(null);


    useEffect(() => {
        const fetchProfilePic = async () => {
            try {
                const response = await axios.get(`http://localhost:4900/api/users/get-photo/${user_id}`, {
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
                  <FcLikePlaceholder className='like-button' />

                  <FaRegBookmark className='save-button'/>
            </div>
        </div>
    );
};

export default Tweet;
