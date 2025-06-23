import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import AllTweetsArea from "./AllTweetsArea";
import { FaPen, FaRegCalendarAlt } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Home = () => {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [tweetContent, setTweetContent] = useState("");
  const [userData, setUserData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const userDataString = sessionStorage.getItem("user");
    if (userDataString) {
      try {
        const parsedUser = JSON.parse(userDataString);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile || !userData) return;

    const formData = new FormData();
    formData.append("userId", userData._id);
    formData.append("photo", selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/upload-photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Profile picture uploaded successfully:", response.data);

      const updatedUser = {
        ...userData,
        photo: response.data.photoUrl, // assuming backend sends the URL
      };
      setUserData(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
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
            {userData.photo ? (
              <img src={userData.photo} alt="User avatar" className="user-profile-pic" />
            ) : (
              <div className="default-avatar">U</div>
            )}

            <div className="file-input-container">
              <label htmlFor="profilePicInput" className="file-input-label">
                Choose File
              </label>
              <input
                type="file"
                id="profilePicInput"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {selectedFile && <span className="file-name">{selectedFile.name}</span>}
              <button className="upload-btn" onClick={handleUploadProfilePic}>
                Upload
              </button>
            </div>

            <p>{userData.email}</p>
            {formattedJoinDate && (
              <p className="user-joined">
                <FaRegCalendarAlt style={{ marginRight: "6px" }} />
                Joined: {formattedJoinDate}
              </p>
            )}

            <p>
              <FaPen style={{ marginRight: "6px" }} />
              Total Tweets: {userData.tweets.length}
            </p>

            <div className="user-gallery">
              <Link to="/liked">
                <div className="liked-tweets">Liked</div>
              </Link>
              <Link to="/saved">
                <div className="saved-tweets">Saved</div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
