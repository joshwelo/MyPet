// Loading.js
import React from 'react';
import spin from '../assets/Dancing kitty.gif'; // Ensure the correct path to the gif

const Loading = () => {
  return (
    <div style={styles.container} className='mt-4'>
      <img src={spin} alt="Loading..." style={styles.image} />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100px', // Adjust the size as needed
    height: '100px',
  }
};

export default Loading;
