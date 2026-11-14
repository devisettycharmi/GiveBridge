# GiveBridge

GiveBridge is a full-stack community donation platform that connects donors and receivers through a trusted, location-aware system. Donors can list items they want to give, receivers can discover nearby donations, and requests are tracked from creation to completion with notifications and admin oversight.

## Problem

Donation coordination often happens across scattered social media groups, making it hard to match supplies to nearby needs. There is no centralized, reliable, and transparent system for tracking donation lifecycle and managing user trust.

## Objectives

- Create a centralized donation platform
- Support donor and receiver workflows
- Enable verified accounts and admin moderation
- Support location-based discovery and filtering
- Manage request lifecycle and completion tracking
- Provide real-time notifications and impact analytics

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Context API
- Backend: Node.js, Express.js, JWT, bcrypt
- Database: MongoDB, Mongoose
- Real-time: Socket.IO
- Maps: Leaflet + OpenStreetMap
- File uploads: Cloudinary
- Security: Helmet, CORS, rate limiting

## Project Structure

```text
GiveBridge/
  client/
    src/
      components/
      pages/
      context/
      services/
      utils/
      hooks/
      assets/
    public/
    package.json
  server/
    controllers/
    models/
    routes/
    middleware/
    services/
    utils/
    config/
    uploads/
    server.js
    package.json
  README.md
  .env.example
  .gitignore
```

## Installation

1. Clone the repository
2. Install frontend dependencies
3. Install backend dependencies
4. Add environment variables
5. Start MongoDB
6. Run both servers

## Environment Variables

Create a `.env` file in the project root with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/givebridge
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## MongoDB Setup

Start local MongoDB or use MongoDB Atlas. Ensure the `MONGODB_URI` points to a valid database. The application uses geospatial indexes for donation and user location matching.

## Backend Setup

```bash
cd server
npm install
npm run dev
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Auth and Roles

- Admin: seed-only account, not public signup
- Donor: can create and manage donations
- Receiver: can browse and request donations

## Key Features

- Donation listing and management
- Search and filters by city, category, and distance
- Request tracking and status flow
- Notification system
- Admin verification and moderation
- Impact statistics and dashboards

## Donation Lifecycle

- AVAILABLE
- REQUESTED
- ACCEPTED
- RESERVED
- COMPLETED
- EXPIRED
- CANCELLED

## Future Enhancements

- AI-based donation matching
- NGO role
- Email/SMS notifications
- Advanced fraud detection
- Delivery tracking

## License

MIT
