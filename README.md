# 🎓 Course Rating Platform

A full-stack MERN application that allows students to view courses, enroll in them, and provide ratings. This platform serves as a centralized hub for course discovery and student feedback.

## 🚀 Features

- **User Authentication**: Secure Login and Registration using JWT.
- **Course Management**: Browse available courses with detailed information.
- **Enrollment System**:
  - Enroll in courses.
  - Drop courses.
  - View enrollment status.
  - Prevent duplicate enrollments.
- **Rating System**:
  - Rate courses (1-5 stars).
  - Real-time average rating updates.
  - Only enrolled students can rate.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience across devices.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JSON Web Tokens (JWT)

## 📂 Project Structure

```
courseRating/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (StarRating, etc.)
│   │   ├── context/        # Context providers (AuthContext)
│   │   ├── hooks/          # Custom hooks (useAuth)
│   │   ├── pages/          # Page components (Login, CourseDetail, etc.)
│   │   └── services/       # API service configuration
│   └── ...
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers (Auth, Course, Enrollment, Rating)
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models (User, Course, Enrollment)
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions (JWT)
│   └── ...
└── ...
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas)

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd courseRating
    ```

2.  **Install Backend Dependencies**

    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../client
    npm install
    ```

### Configuration

1.  Create a `.env` file in the `server` directory:
    ```env
    PORT=8080
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

### Running the Application

1.  **Start the Backend Server**

    ```bash
    cd server
    npm run dev
    ```

2.  **Start the Frontend Development Server**

    ```bash
    cd client
    npm run dev
    ```

3.  Open your browser and navigate to `http://localhost:5173`.

## 📚 Documentation

For detailed information about specific features, please refer to the following guides included in this repository:

- **[Feature Documentation](FEATURE_DOCUMENTATION.md)**: In-depth explanation of the Enrollment and Rating features, architecture, and implementation details.
- **[Enrollment & Rating Guide](ENROLLMENT_RATING_GUIDE.md)**: A guide focused specifically on how the enrollment and rating logic works.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
