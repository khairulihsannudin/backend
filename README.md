# Project Overview
## Features
### 1. Authentication and Authorization
In this project I have implemented authentication with email and password credentials using JWT token, authorization using Bearer access token, and implementing refresh token rotation. 
For security I add whitelist for refresh token so that a user can refresh its access token while refresh token is still active. 
If the user has logged out, its refresh token is removed from the whitelist so the user can't try to get new access token with that refresh token again, thus the user needs to log in again to gain new access token and refresh token.

### 2. Caching
I use Redis for caching the user data so everytime the user needs its data, the server can serves it faster. After this I am goint to implement updating the user information and keeping tha cache up to date with that so the user needs less interaction with the database.

### 3. Email Verification
After user sign up using the sign up route, the user will be automatically assigned with the unverified user. Then the an email will be sent to the user via nodemailer, giving them token for verifying that the user is using real email. If the user is not verified yet, the user cannot access protected routes that needed the user to be verified first.

### 4. Forget Password
If the user forgot his password. This route provide forgot-password route that can send the user email linked to reset-password route with resetToken and verified token so that the system can make sure that the user is real and not some random people trying to access the reset-password endpoint.

### 5. Google OAuth
If the user prefer to use Google account to log in into the application, we provide a route to manage the authentication. When the user is signed in using Google account, the user biodata will be saved in the database and we will send access token and refresh token to interact with the app. 

### 6. User Management
The user can manage the password for the application after signing in using google account so that it can integrate between log in selection. User can also update its biodata and update its password

### 7. Events Management
Here the user can see, register, and unregister from an event