import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Loading from './Loading';

const UserPage = () => {
  const [userData, setUserData] = useState(null);
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
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

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setUpdateStatus('New password and confirmation do not match.');
      return;
    }

    if (auth.currentUser) {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);

      try {
        // Re-authenticate the user with the old password
        await reauthenticateWithCredential(user, credential);
        
        // Update the password
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

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <Loading />;
  }

  return (
    <div className="container mt-3">
      <div className="card shadow-sm p-4 rounded">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="fw-bold mb-1">{userData.username}</h2>
            <p className="text-muted mb-0">{userData.useremail}</p>
          </div>
        </div>

        <div className="pet-section mt-4">
          <h4 className="mb-3">Your Pets</h4>
          {pets.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Pet Name</th>
                    <th scope="col">Breed</th>
                    <th scope="col">Birthday</th>
                  </tr>
                </thead>
                <tbody>
                  {pets.map((pet, index) => (
                    <tr key={index}>
                      <td>{pet.name}</td>
                      <td>{pet.breed}</td>
                      <td>{new Date(pet.birthday).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No pets registered.</p>
          )}
        </div>
        <button
            type="button"
            className="btn btn-outline-primary m-4"
            onClick={() => setShowModal(true)}
          >
            Change Password
          </button>
      </div>

      {/* Change Password Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handlePasswordChange}>
                  Change Password
                </button>
              </div>
              {updateStatus && <div className="alert alert-info mt-2">{updateStatus}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
