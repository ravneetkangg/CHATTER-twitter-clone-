import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import AllTweetsArea from "./AllTweetsArea";
import { FaPen, FaRegCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Home = () => {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [tweetContent, setTweetContent] = useState("");
  const [userData, setUserData] = useState(null);

  // Fetch full user profile using _id from sessionStorage
  useEffect(() => {
    const userDataString = sessionStorage.getItem("user");
    if (userDataString) {
      try {
        const parsedUser = JSON.parse(userDataString);
        fetchUserDetails(parsedUser._id);
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserDetails = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
      setUserData(res.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      navigate("/login");
    }
  };

  const handleTweetChange = (e) => {
    setTweetContent(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handlePostTweet = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tweets/create`, {
        tweet: tweetContent,
        email: userData.email,
      });
      console.log("Tweet posted successfully:", response.data);
      setTweetContent("");
      adjustTextareaHeight();
    } catch (error) {
      console.error("Error posting tweet:", error);
      alert("Failed to post tweet. Please try again.");
    }
  };

  const formattedJoinDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="main-container">
      <div className="tweets-container">
        <div className="post-your-tweet">
          <textarea
            className="tweet-input"
            ref={textareaRef}
            value={tweetContent}
            onChange={handleTweetChange}
            placeholder="What's happening?"
          />
          <button className="post-btn" onClick={handlePostTweet}>
            Tweet
          </button>
        </div>
        <div className="all-tweets-area">
          <AllTweetsArea handlePostTweet={handlePostTweet} />
        </div>
      </div>

      <div className="info-container">
        {userData && (
          <div className="user-info">
            {/* Profile Picture */}
            <div onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
              {userData.photo ? (
                <img src={userData.photo} alt="User avatar" className="user-profile-pic" />
              ) : (
                <div className="default-avatar">U</div>
              )}
            </div>

            {/* Email */}
            <p
              style={{ cursor: "pointer", fontWeight: "bold" }}
              onClick={() => navigate("/profile")}
            >
              {userData.email}
            </p>

            {/* Followers / Following */}
            <div className="user-stats">
              <div className="stat" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
                <strong>{userData.followers?.length || 0}</strong>
                <span>Followers</span>
              </div>
              <div className="stat" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
                <strong>{userData.following?.length || 0}</strong>
                <span>Following</span>
              </div>
            </div>

            {/* Join Date */}
            {formattedJoinDate && (
              <p className="user-joined">
                <FaRegCalendarAlt />
                Joined: {formattedJoinDate}
              </p>
            )}

            {/* Address */}
            {userData.address && (
              <p className="user-joined">
                <FaMapMarkerAlt />
                {userData.address}
              </p>
            )}

            {/* Tweet Count */}
            <p>
              <FaPen />
              Total Tweets: {userData.tweets?.length || 0}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
