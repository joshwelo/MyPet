import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'; // Add query and where
import { auth, db } from '../firebaseConfig'; // Ensure the correct path to firebaseConfig.js
import { onAuthStateChanged } from 'firebase/auth';
import Loading from './Loading'; // Ensure the correct path to Loading.js

const UserPage = () => {
  const [userData, setUserData] = useState(null);
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);

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

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <Loading />;
  }

  return (
    <div className="card m-4">
      <div className="card-header d-flex align-items-center">
        <table>
          <thead>
            <tr>
              <th>
                <img src={userData.userphoto} alt="" className="w-px-50 h-auto rounded-circle" />
              </th>
              <th>
                <h3 className="card-title text-primary fw-bold">&nbsp; {userData.username}</h3>
                <p>{userData.useremail}</p>
              </th>
            </tr>
          </thead>
        </table>
        <div className="position-absolute top-0 end-0" style={{ paddingTop: '10px', paddingRight: '10px' }}>
          <button type="button" className="btn btn-primary" aria-expanded="false">Edit</button>
        </div>
      </div>
      <div className="card-body">
        <h4>Pets</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Pet Name</th>
              <th>Breed</th>
              <th>Birthday</th>
            </tr>
          </thead>
          <tbody>
            {pets.map(pet => (
              <tr key={pet.name}>
                <td>{pet.name}</td>
                <td>{pet.breed}</td>
                <td>{new Date(pet.birthday).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPage;
