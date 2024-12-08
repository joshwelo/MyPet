import { useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, updateDoc, increment, query, where, getDocs, Timestamp, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Loading from './Loading';

const ForumDiscussion = () => {
  const { id } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);
  const [username, setUsername] = useState(""); 
  const [profilePictureUrl, setProfilePictureUrl] = useState(""); // Profile Picture URL
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userVotes, setUserVotes] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentDiscussionId, setCurrentDiscussionId] = useState(null);
  const [isVoting, setIsVoting] = useState({});

  // Fetch user data (username and profile picture)
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username);
          setProfilePictureUrl(userData.profilePictureUrl || "default-profile.png");
        }
      }
    };

    fetchUserData();
  }, []);

  // Fetch discussions
  useEffect(() => {
    const fetchDiscussions = async () => {
      const q = query(collection(db, "discussions"), where("topicId", "==", id));
      const querySnapshot = await getDocs(q);
      const discussionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDiscussions(discussionsList);
      setLoading(false);
    };

    fetchDiscussions();
  }, [id]);

  // Add or update a comment
  const handleAddComment = async () => {
    if (commentText.trim()) {
      const discussionRef = doc(db, "discussions", currentDiscussionId);

      const newComment = {
        text: commentText,
        author: username,
        profilePictureUrl, // Include profile picture URL
        timestamp: Timestamp.now(),
      };

      try {
        await updateDoc(discussionRef, {
          comments: arrayUnion(newComment),
        });

        setDiscussions((prevDiscussions) =>
          prevDiscussions.map((discussion) =>
            discussion.id === currentDiscussionId
              ? { ...discussion, comments: [...discussion.comments, newComment] }
              : discussion
          )
        );

        setCommentText("");
        setShowCommentModal(false);
      } catch (error) {
        console.error("Error adding comment: ", error);
      }
    }
  };

  // Open comment modal
  const openCommentModal = (discussionId) => {
    setCurrentDiscussionId(discussionId);
    const discussion = discussions.find(d => d.id === discussionId);
    setActiveDiscussio(discussion);
    setShowCommentModal(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container-fluid bg-light py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="text-dark fw-bold">Discussions for Topic {id}</h2>

          {/* Discussion List */}
          <div className="list-group">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="list-group-item mb-3 rounded-3 shadow-sm">
                <div className="d-flex w-100">
                  <div className="me-3">
                    <img
                      src={discussion.profilePictureUrl || "default-profile.png"}
                      alt={discussion.author}
                      className="rounded-circle"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <h5>{discussion.title}</h5>
                    <small>Posted by {discussion.author}</small>
                    <p>{discussion.content}</p>
                  </div>
                </div>

                {/* Comments */}
                <button onClick={() => openCommentModal(discussion.id)}>
                  View Comments
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && activeDiscussion && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{activeDiscussion.title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowCommentModal(false)}></button>
              </div>
              <div className="modal-body">
                {activeDiscussion.comments.map((comment, index) => (
                  <div key={index} className="d-flex align-items-start mb-3">
                    <img
                      src={comment.profilePictureUrl || "default-profile.png"}
                      alt={comment.author}
                      className="rounded-circle me-3"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                    <div>
                      <h6 className="fw-bold">{comment.author}</h6>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
                <textarea
                  className="form-control"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <button onClick={handleAddComment}>Add Comment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumDiscussion;
