OTP-SECURE

This is a small practice project I built to get comfortable working with APIs, Node, Express and Supabase. It sends a one time password (otp) to an email and lets you check if that otp is valid.

This is not a login system. There is no password or account here. It is just two simple screens that test the otp flow on its own.

What it does
Send an otp to an email address
Resend the otp if you need a new one sent
Verify if an email and otp code match and are still valid
The rules I had to follow
The otp is always 6 digits, and it can start with a 0
The same otp cannot be sent to the same email twice within 24 hours, without the user knowing this happened
An email can only request 3 new otps per hour
Only the newest otp for an email is ever valid
An otp expires after 30 seconds
If resend is clicked within 5 minutes, it sends back the same code instead of a new one, and just extends how long it lasts
An otp can only be resent 3 times
An otp can only be used once

All of these numbers live in one file, src/config.js, so they are easy to change later.

Tech used
Node.js
Express
Supabase (postgres database)
Plain HTML, CSS and JavaScript for the frontend, no framework
Project structure
OTP-SECURE/
  public/          the two frontend screens
  sql/             the sql file that creates the database table
  src/             all the backend logic and routes
  package.json
  .env.example
How to run this yourself
Clone this repo
Run npm install
Create a Supabase project if you do not have one already
Run the sql file in sql/create_table.sql inside your Supabase sql editor, this creates the table the project needs
Copy .env.example and rename the copy to .env
Fill in your own Supabase url and key inside .env
Run npm start
Open http://localhost:3000 in your browser, it will take you straight to the send otp screen
A design decision worth mentioning

The spec did not say what should happen if someone clicks resend after the 5 minute resend window has already passed. I decided that in that case, a brand new otp gets generated instead, rather than showing an error. This felt like the more user friendly choice.

Notes

Since this is just a practice project, actual emails are not sent. The otp code gets logged to the terminal instead, so the whole flow can still be tested from end to end.

##links
Github: https://github.com/SIJABULILE-NCUBE/OTP-SECURE
Loom video: