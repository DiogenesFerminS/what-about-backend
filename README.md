# WHAT-ABOUT API 

## WHAT IS WHAT-ABOUT?
WHAT-ABOUT is an 'X'-style social network where users can share their opinions on various topics and explore the views of others. It offers all the core features of a modern social network, including likes, follows, comments, search filters, and partial multimedia support. This is a personal project developed by Diogenes Fermin, and I plan to continue its development to push its limits.

## INDEX

1. [General Description](#WHAT-IS-WHAT-ABOUT?)
2. [ENVS Guide](#ENVS-GUIDE)
3. [Technologies / Libreries](#TECHNOLOGIES-/-LIBRERIES)
4. [Steps To Start The Project](#STEPS-TO-START-THE-PROJECT)
5. [Entity-Relationship Diagram](#ENTITY-RELATIONSHIP-DIAGRAM)
6. [About Auth](#ABOUT-AUTH)
7. [Opinion Search Engine](#OPINION-SEARCH-ENGINE)

## ENVS GUIDE

| VARIABLE | TYPE | DESCRIPTION |
| :--- | :---: | --- |
| PORT | Number | Port where the API runs |
| FRONTEND_URL | String | Allowed Origin (Frontend URL) |
| POSTGRES_USER | String | PostgreSQL database user |
| POSTGRES_PASS | String | PostgreSQL database password |
| POSTGRES_NAME | String | PostgreSQL database name |
| POSTGRES_HOST | String | PostgreSQL server host |
| POSTGRES_PORT | Number | PostgreSQL server port |
| JWT_SECRET | String | Secret key to validate access tokens |
| JWT_SECRET_REFRESH | String | Secret key to validate refresh tokens |
| ROUND_OF_SALT | Number | Salt rounds for hashing sensitive data|
| SMTP_HOST | String | SMTP server host for sending emails |
| SMTP_PORT | Number | SMTP server port |
| SMTP_USER | String | SMTP server username |
| SMTP_PASS | String | SMTP server password |
| SMTP_SECURE | Boolean | Manages encryption with the SMTP server |
| SMTP_FROM | String | Default sender name/address for emails |
| CLOUDINARY_CLOUD_NAME | String | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Number | Cloudinary API key |
| CLOUDINARY_API_SECRET | String | Cloudinary API secret |

For more information, you can check .env.templates.

## TECHNOLOGIES / LIBRERIES

* JWT --> Token management

* Cloudinary --> Cloud storage for multimedia files

* Nodemailer --> Email sending

* TypeORM --> Entity and data management

* Zod --> Schema and DTO validation

## STEPS TO START THE PROJECT

1. Clone the repository
2. Install dependencies ``` npm install ```
3. Start the PostgreSQL container ``` docker compose up -d ```
4. Run the seed script to load test data ``` npm run seed ```
5. Start the development server ``` npm run start:dev ```

## ENTITY-RELATIONSHIP DIAGRAM

![ERD](https://res.cloudinary.com/dqclkzb8r/image/upload/v1770684922/der_teltz7.png)
[LINK TO IMAGE](https://res.cloudinary.com/dqclkzb8r/image/upload/v1770684922/der_teltz7.png)

## ABOUT AUTH 
Authentication is implemented using a dual-JWT strategy. An AuthGuard protects all endpoints by validating the existence of the 'auth-token' cookie, except for routes marked with the @Public decorator. We use a short-lived access token (15 min) to authorize requests and a refresh token (7 days) to maintain the session. The refresh token is used via the POST /auth/refresh endpoint to generate a new pair of tokens, keeping the user session active seamlessly. Additionally, the currently logged-in user can be retrieved in controllers using the custom @GetUser decorator. Please note that all tokens are stored as HTTP-Only cookies for enhanced security.


## OPINION SEARCH ENGINE
To optimize post searching, I avoided the typical and inefficient LIKE %query% pattern. Instead, I implemented PostgreSQL Full-Text Search using a searchVector column (type tsvector) in the Opinion entity. This approach tokenizes text and removes irrelevant words (stop words). I also integrated the unaccent extension to ensure accents are ignored during indexing (normalization). A database trigger automatically updates the searchVector by combining the title and content on every INSERT or UPDATE, guaranteeing high-speed performance for all search queries