WebRTC - VideoChat Application

This application is up and running on Heroku. This is the recommended route as it requires much less setup.
https://murmuring-wave-91490.herokuapp.com

Instructions for running locally:

Requirements:
- Node Package Manager (npm) must be installed
- NodeJS must be installed
- PostgreSQL must be installed and running
- The script contained in database/db.sql must be run on the Postgres database
- Make sure the the connection string is initialized with the correct Postgres credentials
  - Example: "postgres://postgres:admin@localhost:5432/postgres"

Run the following commands:
- npm install (this will install any needed dependencies with npm)
- node server.js (this will start the server and listen for connections)

Access the index.html page from a web browser. The application will be running on port 5000.
- http://localhost:5000
