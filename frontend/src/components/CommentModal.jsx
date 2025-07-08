import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './CommentModal.css';

Modal.setAppElement('#root');

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

const CommentModal = ({
    isOpen,
    onRequestClose,
    tweetId,
    currentUserId,
    profilePicUrl,
    tweet,
    tweetedAt,
    user,
    imageUrl,
    apiBaseUrl
}) => {
    const [commentsList, setCommentsList] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchComments();
        }
    }, [isOpen]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/api/tweets/comments/${tweetId}`);
            setCommentsList(response.data.comments || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;

        try {
            setIsSubmitting(true);
            await axios.post(`${apiBaseUrl}/api/tweets/comment/${tweetId}`, {
                userId: currentUserId,
                comment: newComment.trim()
            });
            setNewComment("");
            fetchComments();
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="comment-modal"
            overlayClassName="comment-modal-overlay"
        >
            <button className="modal-close-button" onClick={onRequestClose}>❌</button>

            <div className="modal-tweet">
                <div className="modal-tweet-header">
                    <img src={profilePicUrl} className="modal-user-avatar" alt="User avatar" />
                    <div>
                        <div className="modal-username">{user}</div>
                        <div className="modal-time">{formatDate(tweetedAt)}</div>
                    </div>
                </div>
                <div className="modal-tweet-content">{tweet}</div>
                {imageUrl && (
                    <div className="modal-tweet-image-container">
                        <img src={imageUrl} alt="Tweet visual" className="modal-tweet-image" />
                    </div>
                )}
            </div>

            <div className="comment-input-container">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment..."
                    rows={3}
                    className="comment-textarea"
                ></textarea>
                <button
                    onClick={handlePostComment}
                    disabled={isSubmitting}
                    className="post-comment-btn"
                >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
            </div>

            <div className="comment-thread">
                {commentsList.length > 0 ? (
                    commentsList.map((c, index) => (
                        <div key={index} className="single-comment">
                            <div className="comment-header">
                                <img
                                    src={`https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${c.user._id}.jpeg`}
                                    className="comment-user-avatar"
                                    alt="User avatar"
                                />
                                <div>
                                    <div className="comment-username">{c.user.email}</div>
                                    <div className="comment-time">{formatDate(c.createdAt)}</div>
                                </div>
                            </div>
                            <div className="comment-content">{c.comment}</div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>No comments yet.</p>
                )}
            </div>
        </Modal>
    );
};

export default CommentModal;
