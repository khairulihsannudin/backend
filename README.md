# Project Overview
## Features
### 1. Authentication and Authorization
In this project I have implemented authentication with email and password credentials using JWT token, authorization using Bearer access token, and implementing refresh token rotation. 
For security I add whitelist for refresh token so that a user can refresh its access token while refresh token is still active. 
If the user has logged out, its refresh token is removed from the whitelist so the user can't try to get new access token with that refresh token again, thus the user needs to log in again to gain new access token and refresh token.

### 2. Caching
I use Redis for caching the user data so everytime the user needs its data, the server can serves it faster. After this I am goint to implement updating the user information and keeping tha cache up to date with that so the user needs less interaction with the database.

### 3. Email Verification
I am on progress in making verification through email before the user can be considered as a real user
