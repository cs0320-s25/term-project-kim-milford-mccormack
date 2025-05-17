# Term Project: LoFi 

### Made by Hadley McCormack, Danielle Kim, and Griffin Milford

### Github: https://github.com/cs0320-s25/term-project-kim-milford-mccormack

## Project Goals 
Our goal was to create a functioning webapp that can assist users with finding new study spaces that are perfect for their needs.
As students with our own location preferences, we know how important a good study spot can be, so we wanted to prioritize making the process of finding these spots as painless, intuitive, and user-friendly as possible. 

Using Google Places API, Mapbox, interactive user preferences, and a ranking algorithm, we were able to meet our goal, providing users with curated study spots in various locations. 

## Project Structure 
The backend directory houses important backend files, including classes that interact with and handle Google Places API calls, Mocked Places calls, and response formats. 
It also houses our algorithm handlers and models, as well as our server class. 

The frontend directory contains all files related to rendering the webapp. 
It works with Clerk and Firebase to authorize users, enable easy logins/logouts, and save user preferences to a firestore database, allowing multiple users to be active and saving information at once. 

## Testing
We tested backend functionality, specifically the ranking algorithm, with unit tests. 
API testing was done via browser, from which we saved numerous jsons to use as mock data. 
The mock data was used for further testing, especially once we integrated the frontend, to avoid spamming API calls. 

## Accessibility
Our project conforms to the "A" standard of the W3C Web Content Accessibility Guidelines.
This includes text alternatives, keyboard functionality, meaningful sequencing of content, clear page titles, and non color-reliant ways to convey information.

## How To
1. Make sure you have the proper packages installed. Navigate to the frontend and run `npm install next react react-dom`, `npm install firebase`, and `npm install @clerk/nextjs` if needed. 
2. In the backend, start `Server`. 
3. Navigate back to the frontend. Run `npm run dev`, and click on the link to `localhost 3000` (or a similar port number). 
4. Login via your email with Clerk. Allow Google to know your location. 
5. Set your preferences in the profile page. Once they are to your liking, click `Set my Preferences!`. 
6. On the map page, select/type a keyword. 
7. View your ideal study spots! You can click on a location for more information. 