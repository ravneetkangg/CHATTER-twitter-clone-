import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import AllTweetsArea from "./AllTweetsArea";
import { FaPen, FaRegCalendarAlt } from "react-icons/fa";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [tweetContent, setTweetContent] = useState("");
  const [userData, setUserData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const textareaRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const userDataString = sessionStorage.getItem("user");
    if (userDataString) {
      try {
        const userDataObject = JSON.parse(userDataString);
        setUserData(userDataObject);
        fetchProfilePic(userDataObject._id);
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchProfilePic = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:4900/api/users/get-photo/${userId}`, {
        responseType: 'arraybuffer'
      });
      const base64Flag = `data:${response.headers['content-type']};base64,`;
      const imageStr = arrayBufferToBase64(response.data);
      setProfilePic(base64Flag + imageStr);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
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
      const response = await axios.post("http://localhost:4900/api/tweets/create", {
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
    formData.append("email", userData.email);
    formData.append("photo", selectedFile);

    try {
      const response = await axios.post("http://localhost:4900/api/users/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      console.log("Profile picture uploaded successfully:", response.data);
      fetchProfilePic(userData._id); // Fetch updated profile picture
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
    <>
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
              {profilePic ? (
                <img src={profilePic} alt="User avatar" className="user-profile-pic" />
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
    </>
  );
};

export default Home;
