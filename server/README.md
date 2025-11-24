# Course Rating Backend API

> A Node.js + Express + MongoDB backend for a student course rating and enrollment system.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Request Flow](#-request-flow-the-journey-of-an-api-call)
- [Environment Setup](#-environment-setup)
- [API Endpoints](#-api-endpoints)
- [Key Concepts](#-key-concepts)
- [Common Commands](#-common-commands)

---

## 🎯 Project Overview

This backend powers a **Course Rating Application** where students can:

- **Register & Login** (JWT-based authentication)
- **View all courses** (protected route)
- **Search courses** by title
- **Get course details** by ID
- **Rate & review courses** _(coming soon)_
- **Enroll in courses** _(coming soon)_

---

## 🛠 Tech Stack

| Technology     | Purpose                         |
| -------------- | ------------------------------- |
| **Node.js**    | Runtime environment             |
| **Express.js** | Web framework                   |
| **MongoDB**    | NoSQL database                  |
| **Mongoose**   | ODM (Object Data Modeling)      |
| **JWT**        | Authentication tokens           |
| **bcryptjs**   | Password hashing                |
| **dotenv**     | Environment variables           |
| **nodemon**    | Auto-restart during development |

---

## 📁 Folder Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection logic
│   ├── controllers/
│   │   ├── auth.controller.js # register, login logic
│   │   └── course.controller.js # getAllCourses, getCourseById, searchCourse
│   ├── middleware/
│   │   └── auth.middleware.js # JWT verification middleware
│   ├── models/
│   │   ├── User.js            # User schema (student/admin)
│   │   ├── Course.js          # Course schema
│   │   └── Enrollment.js      # Enrollment schema (future)
│   ├── routes/
│   │   ├── auth.routes.js     # /auth/register, /auth/login
│   │   └── course.routes.js   # /course/all, /course/:id, etc.
│   ├── utils/
│   │   └── jwt.js             # generateToken, verifyToken helpers
│   └── server.js              # Entry point (app setup + server start)
├── .env                       # Environment variables (JWT_SECRET, MONGO_URI, PORT)
├── package.json
└── README.md                  # You are here!
```

---

## 🔄 Request Flow: The Journey of an API Call

### Example: `GET /course/all` (Protected Route)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. CLIENT SENDS REQUEST                                             │
│    GET http://localhost:3000/course/all                             │
│    Headers: { Authorization: "Bearer <jwt_token>" }                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. SERVER.JS (Entry Point)                                          │
│    • Express app receives the request                               │
│    • Middleware: express.json(), cors()                             │
│    • Routes to: app.use("/course", courseRoutes)                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3. COURSE.ROUTES.JS (Router Layer)                                  │
│    • Matches route: router.get("/all", authMiddleware, getAllCourses)│
│    • First runs: authMiddleware                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. AUTH.MIDDLEWARE.JS (Authentication Check)                        │
│    ✓ Extract Authorization header                                   │
│    ✓ Check if it starts with "Bearer "                              │
│    ✓ Extract token: authHeader.split("Bearer ")[1]                  │
│    ✓ Verify token using verifyToken() from utils/jwt.js             │
│    ✓ Attach decoded user to req.user = { id, name, email, role }    │
│    ✓ Call next() → proceed to controller                            │
│                                                                      │
│    ✗ If invalid/missing token → return 401 Unauthorized             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 5. COURSE.CONTROLLER.JS (Business Logic)                            │
│    • getAllCourses(req, res) executes                               │
│    • Queries database: Course.find()                                │
│    • Access authenticated user: req.user                            │
│    • Sends response:                                                │
│      res.status(200).json({                                         │
│        user: req.user,                                              │
│        message: "Courses fetched successfully",                     │
│        courses: [...]                                               │
│      })                                                             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 6. RESPONSE SENT BACK TO CLIENT                                     │
│    Status: 200 OK                                                   │
│    Body: { user: {...}, message: "...", courses: [...] }            │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Takeaway

**Routes → Middleware → Controller → Database → Response**

---

## ⚙️ Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create `.env` file

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/courseRating
JWT_SECRET=your_super_secret_key_here
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 🌐 API Endpoints

### 🔓 Public Routes (No Authentication Required)

| Method | Endpoint         | Description             | Request Body                |
| ------ | ---------------- | ----------------------- | --------------------------- |
| `POST` | `/auth/register` | Create new user account | `{ name, email, password }` |
| `POST` | `/auth/login`    | Login & get JWT token   | `{ email, password }`       |

#### Example: Register

```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:**

```json
{
  "message": "Registration successful",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "studentId": "S1732467890123"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🔒 Protected Routes (Require JWT Token)

| Method | Endpoint                | Description             | Auth Required   |
| ------ | ----------------------- | ----------------------- | --------------- |
| `GET`  | `/course/all`           | Get all courses         | ✅ Bearer Token |
| `GET`  | `/course/:id`           | Get course by ID        | ✅ Bearer Token |
| `GET`  | `/course/search/:title` | Search courses by title | ✅ Bearer Token |

#### Example: Get All Courses

```bash
GET http://localhost:3000/course/all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "message": "Courses fetched successfully",
  "courses": [
    {
      "_id": "...",
      "title": "Introduction to Computer Science",
      "courseCode": "CS101",
      "instructor": "Dr. Smith",
      "credits": 3,
      "avgRating": 4.5,
      "enrolledCount": 25
    }
  ]
}
```

---

## 🧠 Key Concepts

### 1. **JWT Authentication Flow**

```
┌──────────────┐
│ User Registers│
│  or Logs In  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Server generates JWT token           │
│ Payload: { id, name, email, role }   │
│ Signed with: process.env.JWT_SECRET  │
│ Expires in: 7 days                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Client stores token (localStorage)   │
│ Sends it in every protected request: │
│ Authorization: Bearer <token>        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ authMiddleware verifies token        │
│ Attaches user data to req.user       │
│ Controller can access req.user       │
└──────────────────────────────────────┘
```

### 2. **Password Security**

- **Hashing**: Passwords are hashed using `bcryptjs` (10 salt rounds)
- **Mongoose Hook**: `userSchema.pre("save")` automatically hashes password before saving
- **Comparison**: `user.comparePassword(password)` method verifies login

```javascript
// In User.js model
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
```

### 3. **Middleware Chain**

Middleware functions execute **in order**:

```javascript
// In course.routes.js
router.get("/all", authMiddleware, getAllCourses);
//                 ↑ runs first    ↑ runs second
```

- `authMiddleware` validates JWT → calls `next()`
- `getAllCourses` executes business logic

### 4. **req.user Injection**

After successful authentication, `authMiddleware` attaches user data:

```javascript
// In auth.middleware.js
const decoded = verifyToken(token); // { id, name, email, role }
req.user = decoded;
next(); // Pass control to next middleware/controller
```

Now **every controller** can access `req.user`:

```javascript
// In course.controller.js
const getAllCourses = async (req, res) => {
  console.log(req.user); // { id, name, email, role }
  // ... fetch courses
};
```

### 5. **Error Handling Pattern**

Every controller follows this structure:

```javascript
try {
  // 1. Validate input
  // 2. Query database
  // 3. Check if data exists
  // 4. Send success response
} catch (err) {
  console.log(err);
  res.status(500).json({ message: "Internal server error" });
}
```

---

## 🚀 Common Commands

| Task                        | Command                                   |
| --------------------------- | ----------------------------------------- |
| **Install dependencies**    | `npm install`                             |
| **Start dev server**        | `npm run dev`                             |
| **Start production server** | `npm start`                               |
| **Check running processes** | `netstat -ano \| findstr :3000` (Windows) |
| **Kill process on port**    | `taskkill /PID <PID> /F` (Windows)        |

---

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Get all courses (replace <TOKEN> with actual JWT)
curl -X GET http://localhost:3000/course/all \
  -H "Authorization: Bearer <TOKEN>"
```

### Using Postman

1. **Register/Login** → Copy the `token` from response
2. **Create a new request** → GET `http://localhost:3000/course/all`
3. **Add Header**:
   - Key: `Authorization`
   - Value: `Bearer <paste_token_here>`
4. **Send** → You should get courses + user data

---

## 🔍 Debugging Tips

### "Unauthorized" Error?

- Check if token is included in `Authorization` header
- Verify token format: `Bearer <token>` (note the space after "Bearer")
- Check if JWT_SECRET in `.env` matches what was used to sign the token
- Token might be expired (7 days expiry)

### "Internal Server Error"?

- Check server logs in terminal
- Verify MongoDB is running
- Check if MONGO_URI in `.env` is correct

### No autocomplete for `req.headers` or `req.user`?

- Add JSDoc comments to enable IntelliSense:

```javascript
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const myMiddleware = (req, res, next) => {
  // Now you get autocomplete!
};
```

---

## 📚 Next Steps / Future Features

- [ ] Add enrollment system (POST `/course/:id/enroll`)
- [ ] Add rating/review system (POST `/course/:id/review`)
- [ ] Add admin-only routes (create/update/delete courses)
- [ ] Add role-based middleware (`roleMiddleware(['admin'])`)
- [ ] Add input validation (express-validator)
- [ ] Add pagination for course lists
- [ ] Add unit tests (Jest + Supertest)
- [ ] Add API documentation (Swagger)

---

## 💡 Remember This!

### The Golden Rule of This Backend:

**Every protected route follows this pattern:**

1. **Client** sends request with `Authorization: Bearer <token>`
2. **Router** matches the URL and chains middleware
3. **authMiddleware** verifies token → injects `req.user`
4. **Controller** uses `req.user` + queries DB → sends response

### File Naming Convention:

- `*.routes.js` → URL mappings
- `*.controller.js` → Business logic
- `*.middleware.js` → Cross-cutting concerns (auth, logging, etc.)
- `*.js` (in models/) → Mongoose schemas

### Import/Export Pattern:

```javascript
// Named exports (can export multiple)
export const register = () => {};
export const login = () => {};

// Default export (one per file)
export default User;
```

---

**Built with ❤️ for learning MERN stack development**
