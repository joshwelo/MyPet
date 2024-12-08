import React, { useEffect, useState, useRef } from 'react';
import { doc, getDoc,deleteDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebaseConfig'; // Ensure storage is imported
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Loading from './Loading';
import { FaEdit, FaTrash } from 'react-icons/fa';

const UserPage = () => {
  const [userData, setUserData] = useState(null);
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [editName, setEditName] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
        fetchUserDiscussions(user.uid); // Fetch the discussions authored by the logged-in user
      } else {
        setError('No user is signed in');
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserData(userData);
        setUpdatedName(userData.username); // Set initial value for name edit

        // Fetch pets from the separate 'pets' collection
        const petsQuery = query(collection(db, 'pets'), where('userId', '==', userId));
        const petsSnapshot = await getDocs(petsQuery);
        const petsList = petsSnapshot.docs.map(doc => doc.data());
        setPets(petsList);
      } else {
        console.error('No such user!');
        setError('User not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error fetching user data');
    }
  };

  const handleProfilePictureUpload = async (file) => {
    if (!auth.currentUser) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `profilePictures/${userId}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Optional: Track upload progress
      },
      (error) => {
        console.error('Error uploading file:', error);
        setError('Failed to upload profile picture.');
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, { profilePicture: downloadURL });
          setUserData({ ...userData, profilePicture: downloadURL }); // Update local state
        } catch (error) {
          console.error('Error updating profile picture URL:', error);
          setError('Failed to update profile picture.');
        } finally {
          setUploading(false);
        }
      }
    );
  };

  const handleNameChange = async () => {
    if (!auth.currentUser) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { username: updatedName });
      setUserData({ ...userData, username: updatedName }); // Update local state
      setEditName(false);
    } catch (error) {
      console.error('Error updating name:', error);
      setError('Failed to update name. Please try again.');
    }
  };

  const fetchUserDiscussions = async (userId) => {
    try {
      const discussionsQuery = query(collection(db, 'discussions'), where('authorId', '==', userId));
      const discussionsSnapshot = await getDocs(discussionsQuery);
      const discussionsList = discussionsSnapshot.docs.map(doc => {
        const discussionData = doc.data();
        console.log('Individual Discussion:', {
          ...discussionData, 
          documentId: doc.id  // Log the document ID separately
        });
        return {
          ...discussionData,
          documentId: doc.id  // Add document ID to each discussion object
        };
      });
      console.log('All Discussions:', discussionsList);
      setDiscussions(discussionsList);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setError('Error fetching discussions');
    }
  };
  const handleDeleteDiscussion = async (discussionId) => {
    if (!auth.currentUser) {
      setError('User not authenticated. Please log in again.');
      return;
    }
  
    try {
      if (!discussionId) {
        console.error('No discussion ID provided');
        setError('Invalid discussion ID');
        return;
      }
  
      console.log('Attempting to delete discussion with ID:', discussionId);
  
      const discussionDocRef = doc(db, 'discussions', discussionId);
      
      // Delete the document from Firestore
      await deleteDoc(discussionDocRef);
  
      // Update the state to remove the discussion from the UI
      setDiscussions(prevDiscussions => 
        prevDiscussions.filter(discussion => 
          discussion.documentId !== discussionId
        )
      );
  
      console.log('Discussion deleted successfully');
    } catch (error) {
      console.error('Error deleting discussion:', error);
      setError(`Failed to delete discussion: ${error.message}`);
    }
  };
  
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setUpdateStatus('New password and confirmation do not match.');
      return;
    }

    if (auth.currentUser) {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);

      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setUpdateStatus('Password updated successfully!');
        setShowModal(false);
      } catch (error) {
        console.error('Error re-authenticating or updating password:', error);
        setUpdateStatus('Failed to update password. Please check your current password or try again later.');
      }
    } else {
      setUpdateStatus('User not authenticated. Please log in again.');
    }
  };

  if (!userData) {
    return <Loading />;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-lg border-0 rounded-4">
            {/* Profile Header */}
            <div className="card-header bg-primary text-white p-4">
              <div className="d-flex flex-column flex-md-row align-items-center">
                <div className="position-relative mb-3 mb-md-0 me-md-4">
                  <img
                    src={userData.profilePicture || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="rounded-circle border border-3 border-white"
                    width={120}
                    height={120}
                    style={{ 
                      objectFit: 'cover', 
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="d-none"
                    onChange={(e) => handleProfilePictureUpload(e.target.files[0])}
                  />
                </div>
                
                <div className="flex-grow-1">
                  {editName ? (
                    <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className="form-control form-control-lg me-2"
                        value={updatedName}
                        onChange={(e) => setUpdatedName(e.target.value)}
                        placeholder="Enter new name"
                      />
                      <div className="btn-group">
                        <button 
                          className="btn btn-success" 
                          onClick={handleNameChange}
                        >
                          Save
                        </button>
                        <button 
                          className="btn btn-outline-light" 
                          onClick={() => setEditName(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center">
                      <h2 className="mb-1 text-white me-3">
                        {userData.username}
                      </h2>
                      <FaEdit 
                        className="text-white-50 hover-scale" 
                        style={{ 
                          cursor: 'pointer', 
                          fontSize: '1.2rem' 
                        }} 
                        onClick={() => setEditName(true)} 
                      />
                    </div>
                  )}
                  <p className="text-white-50 mb-0">{userData.useremail}</p>
                </div>
              </div>
            </div>

            {/* Discussions Section */}
            <div className="card-body mt-4">
              <h3 className="mb-4 border-bottom pb-2">Your Discussions</h3>
              {discussions.length === 0 ? (
                <div className="alert alert-info text-center">
                  No discussions found. Start a conversation!
                </div>
              ) : (
                <div className="row row-cols-1 g-4">
                  {discussions.map((discussion, index) => (
                    <div key={index} className="col">
                      <div className="card border-light shadow-sm hover-lift">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="card-title mb-0">{discussion.title}</h5>
                            <FaTrash 
                              className="text-danger hover-scale" 
                              style={{ 
                                cursor: 'pointer', 
                                fontSize: '1.1rem' 
                              }}
                              onClick={() => handleDeleteDiscussion(discussion.documentId)}
                            />
                          </div>
                          <p className="card-text text-muted">{discussion.content}</p>
                          {discussion.imageUrl && (
                            <img 
                              src={discussion.imageUrl} 
                              alt="Discussion" 
                              className="img-fluid rounded mb-3" 
                            />
                          )}
                          <div className="d-flex justify-content-between text-muted small">
                            <span>
                              Posted on {new Date(discussion.timestamp.seconds * 1000).toLocaleString()}
                            </span>
                            <span>
                              Upvotes: {discussion.upvotes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Password Button */}
            <div className="card-footer bg-light">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => setShowModal(true)}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Change Password</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body pt-0">
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <label htmlFor="currentPassword">Current Password</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <label htmlFor="newPassword">New Password</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                </div>
                {updateStatus && (
                  <div className="alert alert-info mt-3 text-center">
                    {updateStatus}
                  </div>
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
                  onClick={handlePasswordChange}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
