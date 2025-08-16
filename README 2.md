# Alumni Network Application

A full-stack web application for alumni to connect, network, and communicate with each other.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Profile Management**: Create and update detailed alumni profiles with education, experience, and skills
- **Connection System**: Send, accept, and manage connection requests
- **Real-time Chat**: Communicate with connections through real-time messaging
- **Alumni Directory**: Search and filter alumni by various criteria
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Socket.io client for real-time communication

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.io for real-time features
- Multer for file uploads

## Project Structure

```
├── backend/                # Node.js server
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded files
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Server entry point
│
├── frontend/              # React client
│   ├── public/            # Static files
│   ├── src/               # Source files
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── App.jsx        # Main component
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/alumni-network.git
   cd alumni-network
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the backend directory based on the provided example

4. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login a user
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update user profile
- `PUT /auth/password` - Change password
- `POST /auth/profile-picture` - Upload profile picture

### Users
- `GET /users` - Get all users (with pagination and filters)
- `GET /users/:id` - Get user by ID
- `POST /users/connections/request/:id` - Send connection request
- `POST /users/connections/accept/:id` - Accept connection request
- `POST /users/connections/reject/:id` - Reject connection request
- `GET /users/connections/me` - Get user connections
- `GET /users/connections/requests` - Get pending connection requests
- `DELETE /users/connections/:id` - Remove connection

### Messages
- `GET /messages/:userId` - Get conversation with a user
- `POST /messages/:userId` - Send a message
- `POST /messages/:userId/attachment` - Send a message with attachment
- `GET /messages/recent` - Get recent conversations
- `PUT /messages/:userId/read` - Mark messages as read
- `DELETE /messages/:messageId` - Delete a message

## Socket.io Events

### Client to Server
- `authenticate` - Authenticate user with socket
- `sendMessage` - Send a message
- `typing` - Indicate user is typing
- `markAsRead` - Mark messages as read
- `loadMessages` - Load message history

### Server to Client
- `userOnline` - User came online
- `userOffline` - User went offline
- `receiveMessage` - Receive a new message
- `messageSent` - Confirmation message was sent
- `userTyping` - User is typing indicator
- `messagesRead` - Messages were read
- `messageHistory` - Message history loaded

## License

This project is licensed under the MIT License.