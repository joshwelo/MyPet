const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Adjust the path as necessary

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes); // Use the auth routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import notificationapi from 'notificationapi-node-server-sdk'
// const notificationapi = require('notificationapi-node-server-sdk').default

notificationapi.init(
  'qm01c4bjssth3zirb1yrrikpbm', // clientId
  'q25iqybil1d2e43u0z1lfbne7s699rej6gwqzn0mc5whws4r41bdgdfjic'// clientSecret
)

notificationapi.send({
  notificationId: 'mypet',
  user: {
    id: "morcilla.259726@lipa.sti.edu.ph",
    email: "morcilla.259726@lipa.sti.edu.ph",
    number: "+15005550006" // Replace with your phone number
  },
  mergeTags: {
    "comment": "testComment",
    "commentId": "testCommentId"
  }
})