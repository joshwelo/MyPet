import { useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebaseConfig'; // Import Firebase storage
import { doc, getDoc, collection, addDoc, updateDoc, increment, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Firebase storage methods
import Loading from './Loading';
import { arrayUnion } from 'firebase/firestore';
import { Link, Outlet } from 'react-router-dom';

const subtopics = [
  { id: 1, title: "Common Pet Diseases and Treatments", description: "Discuss common illnesses and remedies." },
  { id: 2, title: "Pet Nutrition and Diet", description: "Share tips on feeding your pets the right way." },
  { id: 3, title: "Training Tips and Tricks", description: "Learn and share methods to train your pets." },
  { id: 4, title: "Pet Adoption Stories", description: "Share your adoption stories or seek advice." },
  { id: 5, title: "Grooming Advice", description: "Discuss grooming techniques and tools." },
  { id: 6, title: "Pet Loss Support", description: "Support each other through the loss of a beloved pet." },
];
const ForumDiscussion = () => {
  const { id } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);
  const [username, setUsername] = useState(""); 
  const [image, setImage] = useState(null); // State for image
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [showModal, setShowModal] = useState(false); // State for controlling the modal visibility
  const [commentText, setCommentText] = useState(""); // State for new comment text
  const [userVotes, setUserVotes] = useState({}); // Track upvotes and downvotes by users
  const [showCommentModal, setShowCommentModal] = useState(false); // State to manage comment modal visibility
  const [currentDiscussionId, setCurrentDiscussionId] = useState(null); // State to manage current discussion for comment
  const [isVoting, setIsVoting] = useState({}); // Track voting state for each discussion to avoid rapid clicks
  const [profilePictureUrl, setProfilePictureUrl] = useState(""); // Profile Picture URL
  const [commentUpvoteStates, setCommentUpvoteStates] = useState({});
  const [replyingToUser, setReplyingToUser] = useState(null); // New state to track who we're replying to
  const [topicTitle, setTopicTitle] = useState("");

  // Fetch username from users collection
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username);
          setProfilePictureUrl(userData.profilePicture || "default-profile.png");
        }
      }
    };

    fetchUserData();
  }, []);

  // Fetch discussions from Firestore
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

// Handle upvote
const handleUpvote = async (discussionId) => {
    const userVote = userVotes[discussionId];
    const discussionRef = doc(db, "discussions", discussionId);
  
    if (userVote === "upvoted" || isVoting[discussionId]) return; // Prevent multiple upvotes or rapid clicking
  
    setIsVoting((prevState) => ({ ...prevState, [discussionId]: true })); // Disable voting temporarily
  
    try {
      if (userVote === "downvoted") {
        await updateDoc(discussionRef, {
          upvotes: increment(1), // Increment by 2 to counteract the downvote
        });
        setUserVotes({ ...userVotes, [discussionId]: "upvoted" });
      } else {
        await updateDoc(discussionRef, {
          upvotes: increment(1),
        });
        setUserVotes({ ...userVotes, [discussionId]: "upvoted" });
      }
  
      setDiscussions((prevDiscussions) =>
        prevDiscussions.map((discussion) =>
          discussion.id === discussionId
            ? { ...discussion, upvotes: discussion.upvotes + (userVote === "downvoted" ? 1 : 1) }
            : discussion
        )
      );
    } finally {
      setIsVoting((prevState) => ({ ...prevState, [discussionId]: false })); // Re-enable voting after action is complete
    }
  };
  useEffect(() => {
    const topic = subtopics.find((topic) => topic.id === parseInt(id));
    if (topic) {
      setTopicTitle(topic.title);
      document.title = `${topic.title} - Discussions`; // Set the browser tab title dynamically
    }
  }, [id]);
  // Handle downvote
  const handleDownvote = async (discussionId) => {
    const userVote = userVotes[discussionId];
    const discussionRef = doc(db, "discussions", discussionId);
  
    if (userVote === "downvoted" || isVoting[discussionId]) return; // Prevent multiple downvotes or rapid clicking
  
    setIsVoting((prevState) => ({ ...prevState, [discussionId]: true })); // Disable voting temporarily
  
    try {
      if (userVote === "upvoted") {
        await updateDoc(discussionRef, {
          upvotes: increment(-1), // Decrement by 2 to counteract the upvote
        });
        setUserVotes({ ...userVotes, [discussionId]: "downvoted" });
      } else {
        await updateDoc(discussionRef, {
          upvotes: increment(-1),
        });
        setUserVotes({ ...userVotes, [discussionId]: "downvoted" });
      }
  
      setDiscussions((prevDiscussions) =>
        prevDiscussions.map((discussion) =>
          discussion.id === discussionId
            ? { ...discussion, upvotes: discussion.upvotes - (userVote === "upvoted" ? 1 : 1) }
            : discussion
        )
      );
    } finally {
      setIsVoting((prevState) => ({ ...prevState, [discussionId]: false })); // Re-enable voting after action is complete
    }
  };

  // Handle creating a new discussion
// Handle creating a new discussion
const handleCreateDiscussion = async () => {
  if (newDiscussionTitle.trim() && newDiscussionContent.trim() && username) {
    setCreatingDiscussion(true);

    try {
      let imageUrl = null;

      if (image) {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `discussions/${Date.now()}_${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        await uploadTask;
        imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }

      const newDiscussion = {
        title: newDiscussionTitle,
        content: newDiscussionContent,
        author: username,
        authorId: auth.currentUser?.uid, // Add the user's ID
        profilePictureUrl: profilePictureUrl || "default-profile.png", // Add the user's photo URL
        upvotes: 0,
        comments: [],
        timestamp: Timestamp.now(),
        topicId: id,
        imageUrl: imageUrl,
      };

      const docRef = await addDoc(collection(db, "discussions"), newDiscussion);

      setDiscussions([...discussions, { id: docRef.id, ...newDiscussion }]);
      setNewDiscussionTitle("");
      setNewDiscussionContent("");
      setImage(null);
      setImagePreview(null); // Clear the preview
      setShowModal(false); // Close the modal after creation
    } catch (error) {
      console.error("Error creating discussion: ", error);
    }

    setCreatingDiscussion(false);
  }
};


  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddComment = async () => {
    if (commentText.trim()) {
      const discussionRef = doc(db, "discussions", currentDiscussionId);
  
      // Determine the comment text, removing the "replying to" prefix if present
      const cleanCommentText = replyingToUser
        ? commentText.replace(`replying to ${replyingToUser} - `, '').trim()
        : commentText;
  
      const newComment = {
        text: cleanCommentText,
        author: username,
        profilePictureUrl: profilePictureUrl || "default-profile.png",
        userId: auth.currentUser?.uid,
        timestamp: Timestamp.now(),
        upvotes: 0,
        replyingTo: replyingToUser, // Optional: store who the comment is replying to
      };
  
      try {
        // Add the comment to the Firestore database
        await updateDoc(discussionRef, {
          comments: arrayUnion(newComment),
        });
  
        // Update the local state to include the new comment, triggering a re-render
        setDiscussions((prevDiscussions) =>
          prevDiscussions.map((discussion) =>
            discussion.id === currentDiscussionId
              ? { ...discussion, comments: [...discussion.comments, newComment] }
              : discussion
          )
        );
  
        // Reset comment-related states
        setCommentText("");
        setReplyingToUser(null);
        setShowCommentModal(true);  // This forces the modal to show with updated comments
  
      } catch (error) {
        console.error("Error adding comment: ", error);
      }
    }
  };
  
  // New method to handle reply
  const handleReply = (commentAuthor) => {
    setReplyingToUser(commentAuthor);
    setCommentText(`replying to ${commentAuthor} - `);
    // Ensure comment input is focused
    document.querySelector('input[placeholder="Write a comment..."]')?.focus();
  };
  
  const handleCommentUpvote = async (discussionId, commentIndex) => {
    if (!auth.currentUser) return; // Ensure user is logged in

    const voteKey = `${discussionId}-comment-${commentIndex}`;
    const discussionRef = doc(db, "discussions", discussionId);

    try {
      // Create a copy of the current discussions to modify
      const updatedDiscussions = [...discussions];
      const discussionIndex = updatedDiscussions.findIndex(d => d.id === discussionId);

      if (discussionIndex === -1) return;

      // Create a copy of comments to modify
      const updatedComments = [...updatedDiscussions[discussionIndex].comments];
      
      // Create a copy of current upvote states
      const updatedUpvoteStates = {...commentUpvoteStates};

      // Determine current upvote state for this comment
      const currentUpvoteState = updatedUpvoteStates[voteKey] || false;

      // Initialize upvotes if not exists
      if (!updatedComments[commentIndex].upvotes) {
        updatedComments[commentIndex].upvotes = 0;
      }

      // Toggle upvote logic
      if (currentUpvoteState) {
        // If already upvoted, remove the upvote
        updatedComments[commentIndex].upvotes -= 1;
        updatedUpvoteStates[voteKey] = false;
      } else {
        // If not upvoted, add the upvote
        updatedComments[commentIndex].upvotes += 1;
        updatedUpvoteStates[voteKey] = true;
      }

      // Update the specific comment in the comments array
      updatedDiscussions[discussionIndex].comments = updatedComments;

      // Update local states
      setDiscussions(updatedDiscussions);
      setCommentUpvoteStates(updatedUpvoteStates);

      // Prepare update for Firestore
      const commentUpdateArray = updatedDiscussions[discussionIndex].comments.map(comment => ({
        ...comment,
        upvotes: comment.upvotes || 0
      }));

      // Update Firestore
      await updateDoc(discussionRef, {
        comments: commentUpdateArray
      });

    } catch (error) {
      console.error("Error upvoting comment: ", error);
    }
  };


  const openCommentModal = (discussionId) => {
    setCurrentDiscussionId(discussionId);
    
    // Set active discussion to the specific one
    const discussion = discussions.find(d => d.id === discussionId);
    setActiveDiscussion(discussion);
  
    setShowCommentModal(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container-fluid bg-light py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Header with Topic and Create Discussion */}
          <div className="d-flex justify-content-between align-items-center mt-4">
          <h2 className="text-dark fw-bold">{topicTitle}</h2>
          </div>
          <button 
              className="btn btn-primary rounded-pill shadow-sm mb=3" 
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>Create Discussion
            </button>
            <Link to="/Home/ForumSubTopic">
              <button className="btn btn-secondary rounded-pill shadow-sm mx-3">Go Back</button>
            </Link>
          {/* Discussion List */}
          <div className="list-group mt-3">
            {discussions.map((discussion) => (
              <div 
                key={discussion.id} 
                className="list-group-item list-group-item-action bg-white mb-3 rounded-3 border-0 shadow-sm"
              >
                <div className="d-flex w-100">
                  {/* Voting Section */}
                  <div 
                    className="d-flex flex-column align-items-center me-3 p-2 bg-light rounded"
                    style={{minWidth: '60px'}}
                  >
                    <button 
                      className={`btn btn-link text-muted p-0 ${userVotes[discussion.id] === "upvoted" ? "text-success" : ""}`}
                      onClick={() => handleUpvote(discussion.id)}
                    >
                      <i className='bx bxs-upvote'></i>
                    </button>
                    <span className="my-1 fw-bold">{discussion.upvotes}</span>
                    <button 
                      className={`btn btn-link text-muted p-0 ${userVotes[discussion.id] === "downvoted" ? "text-danger" : ""}`}
                      onClick={() => handleDownvote(discussion.id)}
                    >
                     <i className='bx bxs-downvote'></i>
                    </button>
                  </div>

                  {/* Discussion Content */}
                  <div className="flex-grow- mt-3">

                    <small className="text-muted d-flex align-items-center">
                      {/* Display Profile Picture */}
                      {discussion.profilePictureUrl && (
                        <img 
                          src={discussion.profilePictureUrl} 
                          alt="Author Profile" 
                          className="rounded-circle me-2" 
                          style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                        />
                      )}
                      Posted by {discussion.author} 
                      {' · '}
                      {new Date(discussion.timestamp.seconds * 1000).toLocaleDateString()}
                    </small>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <h5 className="mb-1 fw-bold">{discussion.title}</h5>
                    </div>
                    <p className="mb-2">{discussion.content}</p>

                    {discussion.imageUrl && (
                      <img 
                        src={discussion.imageUrl} 
                        alt="Discussion" 
                        className="img-fluid rounded mb-3"
                      />
                    )}

                    {/* Comments Section */}
                    <div className="d-flex justify-content-between align-items-center">
                      <button 
                        className="btn btn-sm btn-outline-secondary rounded-pill"
                        onClick={() => openCommentModal(discussion.id)}
                      >
                        <i className="bi bi-chat-left me-2"></i>
                        {discussion.comments.length} Comments
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Discussion Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Create New Discussion</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Discussion Title"
                  value={newDiscussionTitle}
                  onChange={(e) => setNewDiscussionTitle(e.target.value)}
                />
                <textarea
                  className="form-control mb-3"
                  rows="4"
                  placeholder="Discussion Content"
                  value={newDiscussionContent}
                  onChange={(e) => setNewDiscussionContent(e.target.value)}
                ></textarea>
                <input 
                  type="file" 
                  className="form-control mb-3"
                  onChange={handleImageChange} 
                />
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="img-fluid rounded mb-3" 
                  />
                )}
              </div>
              <div className="modal-footer border-top-0">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateDiscussion}
                  disabled={creatingDiscussion}
                >
                  {creatingDiscussion ? 'Creating...' : 'Create Discussion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Comment Modal */}
        {showCommentModal && (
  <div 
    className="modal fade show" 
    style={{ 
      display: 'block', 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      zIndex: 1050 
    }} 
    tabIndex="-1"
  >
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content border-0 rounded-3 shadow-sm">
        <div className="modal-header bg-light py-3 px-4 border-bottom">
          <div className="d-flex align-items-center">
            <img 
              src={activeDiscussion?.profilePictureUrl} 
              alt="Profile" 
              className="rounded-circle me-3" 
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
            <div>
              <h5 className="mb-0 fw-bold">{activeDiscussion?.title}</h5>
              <small className="text-muted">{username}</small>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowCommentModal(false)}
          ></button>
        </div>
        
        <div className="modal-body p-0">
  {/* Comments Container */}
  <div
  className="comments-container overflow-auto px-4 pt-3"
  style={{ maxHeight: '400px' }}
>
  {activeDiscussion?.comments?.length > 0 ? (
    activeDiscussion.comments.map((comment, index) => {
      const voteKey = `${currentDiscussionId}-comment-${index}`;
      const isUpvoted = commentUpvoteStates[voteKey];

      return (
        <div key={index} className="d-flex mb-3">
          <img
            src={comment.profilePictureUrl}
            alt="Commenter"
            className="rounded-circle me-3"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />

          <div className="flex-grow-1">
            <div
              className="bg-light p-2 px-3 rounded-4"
              style={{ display: 'inline-block' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="mb-0 fw-bold text-dark me-2">
                  {comment.author}
                </h6>
                <small className="text-muted">
                  {new Date(comment.timestamp.seconds * 1000).toLocaleString()}
                </small>
              </div>
              <p
                className="mb-0 text-dark"
                style={{ fontSize: '0.9rem' }}
              >
                {comment.text}
              </p>
            </div>

            <div className="d-flex align-items-center mt-1">
              <button
                className={`btn btn-link btn-sm p-0 me-2 ${isUpvoted ? 'fw-bold text-primary' : 'text-muted'}`}
                onClick={() => handleCommentUpvote(currentDiscussionId, index)}
              >
                <i className="bx bx-upvote"></i> 
                Upvote ({comment.upvotes || 0})
              </button>
              <button 
                className="btn btn-link btn-sm text-muted p-0"
                onClick={() => handleReply(comment.author)}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      );
    })
  ) : (
    <div className="text-center text-muted py-4">
      No comments yet. Start the conversation!
    </div>
  )}
</div>

  {/* New Comment Input */}
  <div className="px-4 py-3 border-top">
    <div className="d-flex align-items-center">
      <img
        src={profilePictureUrl}
        alt="Your Profile"
        className="rounded-circle me-3"
        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
      />
      <div className="input-group">
        <input
          type="text"
          className="form-control rounded-pill"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => {
            // Allow manual editing of the comment, including the "replying to" prefix
            setCommentText(e.target.value);
          }}
        />
        <div className="input-group-append">
          <button
            className="btn btn-link text-primary"
            onClick={handleAddComment}
            disabled={!commentText.trim()}
          >
            <i className="bx bxs-send"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ForumDiscussion;
