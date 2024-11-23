/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

exports.sendEventNotification = functions.firestore
  .document('calendar/{eventId}')
  .onCreate(async (snapshot, context) => {
    const event = snapshot.data();

    const payload = {
      interests: [`user-${event.userId}`], // Subscribe users based on unique IDs
      web: {
        notification: {
          title: `Upcoming Event: ${event.eventName}`,
          body: `Scheduled for ${event.date} at ${event.time}`,
        },
      },
    };

    const instanceId = 'YOUR_INSTANCE_ID';
    const secretKey = 'YOUR_SECRET_KEY';

    await axios.post(
      `https://${instanceId}.pushnotifications.pusher.com/publish_api/v1/instances/${instanceId}/publishes`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
  });

