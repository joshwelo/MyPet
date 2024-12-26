// Loading.js
import React from 'react';
import spin from '../assets/Dancing kitty.gif'; // Ensure the correct path to the gif

const Loading = () => {
  return (
    <div style={styles.container} className='mt-4'>
      
      <lottie-player src="https://lottie.host/84569736-a2ae-4282-863d-ab3501b93565/IdJZZ3flYM.json"  background="##FFFFFF" speed="1" style={{ maxWidth: "300px", height: "auto" }} loop autoplay direction="1" mode="normal"></lottie-player>
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
