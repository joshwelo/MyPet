const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const app = express();

// Load OAuth 2.0 credentials from the downloaded JSON file
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json')));
const { client_id, client_secret, redirect_uris } = credentials.installed;

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  client_id, 
  client_secret, 
  redirect_uris[0] // This should be the URI where the user will be redirected after consent
);

// Scopes required for accessing Google Calendar
const scopes = ['https://www.googleapis.com/auth/calendar'];

// Step 1: Redirect to Google for authentication
app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(authUrl);
});

// Step 2: Handle callback and exchange authorization code for tokens
app.get('/oauth2callback', (req, res) => {
  const { code } = req.query;

  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      return res.send('Error retrieving tokens: ' + err);
    }

    // Save the tokens to be used for future API calls
    oauth2Client.setCredentials(tokens);

    // Store tokens securely (session, database, etc.)
    res.send('Authentication successful!');
  });
});

// Step 3: Make an API call (e.g., list events from Google Calendar)
app.get('/list-events', (req, res) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  calendar.events.list(
    {
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    },
    (err, response) => {
      if (err) {
        return res.send('Error fetching events: ' + err);
      }

      const events = response.data.items;
      if (events.length) {
        res.json(events);
      } else {
        res.send('No upcoming events found.');
      }
    }
  );
});

// Start the Express server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
