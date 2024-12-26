import { useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebaseConfig'; // Import Firebase storage
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  increment, 
  query, 
  where, 
  onSnapshot, 
  Timestamp, 
  arrayUnion 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Firebase storage methods
import Loading from './Loading';
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
  const [activeDiscussionComments, setActiveDiscussionComments] = useState([]);
  const [expandedDiscussions, setExpandedDiscussions] = useState({});
  console.log("Current user:", auth.currentUser);

  // Fetch username from users collection
  // Real-time listener for user data
  useEffect(() => {
    if (!auth.currentUser) return;

    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUsername(userData.username);
        setProfilePictureUrl(userData.profilePicture || "default-profile.png");
      }
    });

    return () => unsubscribe();
  }, []);
  // Fetch discussions from Firestore
 // Real-time listener for discussions
 useEffect(() => {
  if (!id) return;

  const discussionsQuery = query(
    collection(db, "discussions"), 
    where("topicId", "==", id)
  );

  const unsubscribe = onSnapshot(discussionsQuery, (querySnapshot) => {
    const discussionsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort discussions by timestamp, most recent first
    discussionsList.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

    setDiscussions(discussionsList);
    setLoading(false);
  }, (error) => {
    console.error("Error fetching discussions: ", error);
    setLoading(false);
  });

  return () => unsubscribe();
}, [id]);
const toggleComments = (discussionId) => {
  setExpandedDiscussions(prev => ({
    ...prev,
    [discussionId]: !prev[discussionId]
  }));
};
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
      document.title = `${topic.title} - Discussions`;
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
    if (!commentText.trim() || !currentDiscussionId) return;
  
    const discussionRef = doc(db, "discussions", currentDiscussionId);
  
    // Clean comment text if replying to someone
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
      replyingTo: replyingToUser,
    };
  
    try {
      // First, get the current discussion data to ensure we have the authorId
      const discussionSnapshot = await getDoc(discussionRef);
      if (!discussionSnapshot.exists()) {
        console.error("Discussion not found");
        return;
      }
  
      const discussionData = discussionSnapshot.data();
      
      // Add the comment to the discussion
      await updateDoc(discussionRef, {
        comments: arrayUnion(newComment),
      });
  
      // Only create notification if we have both the discussion author ID and current user
      if (
        discussionData.authorId && 
        auth.currentUser?.uid &&
        discussionData.authorId !== auth.currentUser.uid // Don't notify if commenting on own post
      ) {
        // Generate current date and time
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];
        const formattedTime = now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        });
  
        // Create notification with verified userId
        await addDoc(collection(db, "calendar"), {
          date: formattedDate,
          time: formattedTime,
          eventName: `New Comment on: ${discussionData.title}`,
          description: `${username} commented: "${cleanCommentText}"`,
          userId: discussionData.authorId,
          notified: false,
          read: false
        });
      }
  
      // Reset states
      setCommentText("");
      setCurrentDiscussionId(null);
      setReplyingToUser(null);
  
    } catch (error) {
      console.error("Error adding comment: ", error);
      // Optionally show error to user
      alert("Failed to add comment. Please try again.");
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

// Modify the real-time comments listener
useEffect(() => {
  if (!currentDiscussionId) return;

  const discussionRef = doc(db, "discussions", currentDiscussionId);

  const unsubscribe = onSnapshot(discussionRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const discussionData = docSnapshot.data();
      
      // Update discussions array to reflect latest comments
      setDiscussions(prevDiscussions => 
        prevDiscussions.map(discussion => 
          discussion.id === currentDiscussionId 
            ? { ...discussion, comments: discussionData.comments || [] }
            : discussion
        )
      );

      // Update active discussion to ensure modal reflects latest data
      setActiveDiscussion(prevDiscussion => ({
        ...prevDiscussion,
        comments: discussionData.comments || []
      }));
    }
  }, (error) => {
    console.error("Error listening to discussion comments: ", error);
  });

  return () => unsubscribe();
}, [currentDiscussionId]);

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
          
          <div className="mb-3 d-flex gap-3">
            <button 
              className="btn btn-primary rounded-pill shadow-sm"
              onClick={() => setShowModal(true)}
            >
              <i className="bx bx-plus-circle me-2"></i>Create Discussion
            </button>
            <Link to="/Home/ForumSubTopic">
              <button className="btn btn-secondary rounded-pill shadow-sm">Go Back</button>
            </Link>
          </div>

          {/* Discussion List */}
          <div className="d-flex flex-column gap-4">
            {discussions.map((discussion) => (
              <div 
                key={discussion.id} 
                className="bg-white rounded-lg shadow-sm p-4"
              >
                {/* Main Discussion Content */}
                <div className="d-flex">
                  {/* Voting Section */}
                  <div className="d-flex flex-column align-items-center me-4 bg-light rounded p-2" style={{width: "60px"}}>
                    <button 
                      className={`btn btn-link p-0 ${userVotes[discussion.id] === "upvoted" ? "text-primary" : "text-secondary"}`}
                      onClick={() => handleUpvote(discussion.id)}
                    >
                      <i className="bx bxs-up-arrow text-2xl"></i>
                    </button>
                    <span className="my-1 fw-bold">{discussion.upvotes}</span>
                    <button 
                      className={`btn btn-link p-0 ${userVotes[discussion.id] === "downvoted" ? "text-danger" : "text-secondary"}`}
                      onClick={() => handleDownvote(discussion.id)}
                    >
                      <i className="bx bxs-down-arrow text-2xl"></i>
                    </button>
                  </div>

                  {/* Discussion Content */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center text-secondary small">
                      <img 
                        src={discussion.profilePictureUrl} 
                        alt="Author Profile" 
                        className="rounded-circle me-2" 
                        style={{width: "32px", height: "32px", objectFit: "cover"}}
                      />
                      <span>Posted by {discussion.author}</span>
                      <span className="mx-2">·</span>
                      <span>{new Date(discussion.timestamp.seconds * 1000).toLocaleDateString()}</span>
                    </div>

                    <h3 className="fs-5 fw-bold mt-2">{discussion.title}</h3>
                    <p className="mt-2 text-secondary">{discussion.content}</p>

                    {discussion.imageUrl && (
                      <img 
                        src={discussion.imageUrl} 
                        alt="Discussion" 
                        className="mt-3 rounded img-fluid" 
                        style={{maxHeight: "384px", objectFit: "cover"}}
                      />
                    )}

                    {/* Comments Section */}
                    {expandedDiscussions[discussion.id] && (
                      <div className="mt-4 bg-light rounded p-4">
                        {/* Comments List */}
                        <div className="comments-container mb-4">
                          {discussion.comments.map((comment, index) => {
                            const voteKey = `${discussion.id}-comment-${index}`;
                            const isUpvoted = commentUpvoteStates[voteKey];

                            return (
                              <div key={index} className="d-flex mb-3">
                                <img
                                  src={comment.profilePictureUrl}
                                  alt="Commenter"
                                  className="rounded-circle me-3"
                                  style={{width: "32px", height: "32px", objectFit: "cover"}}
                                />
                                <div className="flex-grow-1">
                                  <div className="bg-white p-3 rounded">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <h6 className="mb-0 fw-bold">{comment.author}</h6>
                                      <small className="text-secondary">
                                        {new Date(comment.timestamp.seconds * 1000).toLocaleString()}
                                      </small>
                                    </div>
                                    <p className="mb-0">{comment.text}</p>
                                  </div>
                                  <div className="d-flex align-items-center mt-2">
                                    <button
                                      className={`btn btn-link btn-sm p-0 me-3 ${isUpvoted ? 'text-primary fw-bold' : 'text-secondary'}`}
                                      onClick={() => handleCommentUpvote(discussion.id, index)}
                                    >
                                      <i className="bx bxs-like me-1"></i>
                                      {comment.upvotes || 0}
                                    </button>
                                    <button 
                                      className="btn btn-link btn-sm text-secondary p-0"
                                      onClick={() => handleReply(comment.author)}
                                    >
                                      <i className="bx bx-reply me-1"></i>
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Comment Input */}
                        <div className="d-flex align-items-center">
                          <img
                            src={profilePictureUrl}
                            alt="Your Profile"
                            className="rounded-circle me-3"
                            style={{width: "32px", height: "32px", objectFit: "cover"}}
                          />
                          <div className="flex-grow-1 position-relative">
                          <input
    type="text"
    className="form-control rounded-pill pe-5"
    placeholder="Write a comment..."
    value={currentDiscussionId === discussion.id ? commentText : ''} // Correctly binds commentText
    onChange={(e) => {
        setCurrentDiscussionId(discussion.id);
        setCommentText(e.target.value);
    }}
/>
                            <button
                              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-primary"
                              onClick={() => {
                                setCurrentDiscussionId(discussion.id);
                                handleAddComment();
                              }}
                              disabled={!commentText.trim() || currentDiscussionId !== discussion.id}
                              style={{marginRight: "8px"}}
                            >
                              <i className="bx bxs-send"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                </div>
                                    {/* Enhanced Comments Button */}
                                    <button 
                      className={`mt-4 btn rounded-pill d-inline-flex align-items-center ${
                        expandedDiscussions[discussion.id] 
                          ? "btn-light" 
                          : "btn-outline-primary"
                      }`}
                      onClick={() => toggleComments(discussion.id)}
                    >
                      <i className={`bx ${expandedDiscussions[discussion.id] ? 'bx-x' : 'bx-message-rounded'} me-2`}></i>
                      {expandedDiscussions[discussion.id] ? "Close Comments" : "Open Comments"}
                      <span className="ms-2 badge bg-secondary rounded-pill">
                        {discussion.comments.length}
                      </span>
                    </button>
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
                  placeholder="Insert Image"
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
    </div>
  );
};

export default ForumDiscussion;
