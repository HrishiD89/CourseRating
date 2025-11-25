# Rating and Enrollment Feature Implementation Guide

## 📚 Overview

This guide explains how the **enrollment** and **rating** features work in your course rating platform, including how the `Enrollment` model is used throughout the backend.

---

## 🗂️ Database Models

### 1. **Enrollment Model** (`server/src/models/Enrollment.js`)

The Enrollment model is the **bridge** between Users and Courses. It tracks:

```javascript
{
  user: ObjectId,           // Reference to User who enrolled
  course: ObjectId,         // Reference to Course enrolled in
  status: String,           // 'applied', 'enrolled', 'dropped', 'completed'
  progress: Number,         // 0-100 (for future progress tracking)
  personalRating: Number    // User's rating (1-5 stars)
}
```

**Key Features:**

- **Unique Index**: Prevents a user from enrolling in the same course twice
- **Personal Rating**: Each enrollment can have its own rating
- **Status Tracking**: Tracks enrollment lifecycle (enrolled → completed/dropped)

### 2. **Course Model** (`server/src/models/Course.js`)

Updated to include:

```javascript
{
  avgRating: Number,        // Average of all ratings
  totalRatings: Number,     // Count of ratings
  department: String        // Course department
}
```

---

## 🔧 Backend Implementation

### **Enrollment Controller** (`server/src/controllers/enrollment.controller.js`)

#### 1. **Enroll in Course**

```
POST /enrollment/enroll/:courseId
```

**What it does:**

- Checks if course exists
- Checks if user is already enrolled
- Creates a new Enrollment record with status 'enrolled'
- Returns the enrollment with populated course details

**Usage Example:**

```javascript
const response = await enrollmentAPI.enrollInCourse(courseId);
// Creates: { user: userId, course: courseId, status: 'enrolled' }
```

#### 2. **Drop Course**

```
DELETE /enrollment/drop/:courseId
```

**What it does:**

- Finds the enrollment record
- Updates status to 'dropped' (doesn't delete the record)
- Preserves history of enrollment

**Why not delete?**

- Keeps historical data
- Can track which courses users tried
- Can prevent re-enrollment if needed

#### 3. **Get Enrollment Status**

```
GET /enrollment/status/:courseId
```

**What it does:**

- Checks if user is enrolled in a specific course
- Returns `{ enrolled: true/false, enrollment: {...} }`

**Used for:**

- Showing "Enroll" vs "Drop" button
- Enabling/disabling rating feature
- Displaying enrollment badge

#### 4. **Get My Enrollments**

```
GET /enrollment/my-courses
```

**What it does:**

- Fetches all courses the user is enrolled in
- Excludes dropped courses
- Populates full course details

**Used for:**

- Dashboard showing user's courses
- "My Courses" page

---

### **Rating Controller** (`server/src/controllers/rating.controller.js`)

#### 1. **Rate Course**

```
POST /rating/rate/:courseId
Body: { rating: 1-5 }
```

**What it does:**

1. Validates rating (must be 1-5)
2. Checks if user is enrolled (status must be 'enrolled' or 'completed')
3. Updates `personalRating` in the Enrollment record
4. Calls `updateCourseAverageRating()` to recalculate course average

**Important:** Users can only rate courses they're enrolled in!

#### 2. **Get My Rating**

```
GET /rating/my-rating/:courseId
```

**What it does:**

- Finds the enrollment record
- Returns the user's personal rating for that course

**Used for:**

- Pre-filling the star rating component
- Showing "You rated this X stars"

#### 3. **Update Course Average Rating** (Helper Function)

This is called automatically after any rating change:

```javascript
const updateCourseAverageRating = async (courseId) => {
  // 1. Find all enrollments with ratings for this course
  const enrollments = await Enrollment.find({
    course: courseId,
    personalRating: { $ne: null },
  });

  // 2. Calculate average
  const avgRating = totalRating / enrollments.length;

  // 3. Update Course model
  await Course.findByIdAndUpdate(courseId, {
    avgRating: avgRating,
    totalRatings: enrollments.length,
  });
};
```

**Why this approach?**

- Ratings are stored per-enrollment (personal ratings)
- Course average is calculated from all enrollment ratings
- Keeps data normalized and accurate

---

## 🎨 Frontend Implementation

### **API Service** (`client/src/services/api.js`)

Added two new API groups:

```javascript
// Enrollment APIs
export const enrollmentAPI = {
  enrollInCourse: (courseId) => api.post(`/enrollment/enroll/${courseId}`),
  dropCourse: (courseId) => api.delete(`/enrollment/drop/${courseId}`),
  getEnrollmentStatus: (courseId) => api.get(`/enrollment/status/${courseId}`),
  getMyEnrollments: () => api.get("/enrollment/my-courses"),
};

// Rating APIs
export const ratingAPI = {
  rateCourse: (courseId, rating) =>
    api.post(`/rating/rate/${courseId}`, { rating }),
  getMyRating: (courseId) => api.get(`/rating/my-rating/${courseId}`),
};
```

---

### **StarRating Component** (`client/src/components/StarRating.jsx`)

A reusable component with two modes:

#### **Interactive Mode** (for rating)

```jsx
<StarRating
  rating={userRating}
  onRatingChange={handleRatingChange}
  size="large"
/>
```

#### **Readonly Mode** (for display)

```jsx
<StarRating rating={course.avgRating} readonly size="small" />
```

**Features:**

- Hover effects (shows which star you'll select)
- Click to rate
- Visual feedback
- Customizable sizes (small, medium, large)

---

### **CourseDetail Page** (`client/src/pages/CourseDetail.jsx`)

#### **State Management**

```javascript
// Course data
const [course, setCourse] = useState(null);

// Enrollment state
const [isEnrolled, setIsEnrolled] = useState(false);
const [enrollmentLoading, setEnrollmentLoading] = useState(false);

// Rating state
const [userRating, setUserRating] = useState(0);
const [ratingLoading, setRatingLoading] = useState(false);
```

#### **Data Fetching on Page Load**

```javascript
useEffect(() => {
  fetchCourseDetail(); // Get course info
  fetchEnrollmentStatus(); // Check if enrolled
  fetchUserRating(); // Get user's rating
}, []);
```

#### **Enrollment Flow**

1. **User clicks "Enroll Now"**

   ```javascript
   handleEnroll() → enrollmentAPI.enrollInCourse(id)
   → setIsEnrolled(true)
   → Button changes to "Drop Course"
   → Rating section appears
   ```

2. **User clicks "Drop Course"**
   ```javascript
   handleDrop() → enrollmentAPI.dropCourse(id)
   → setIsEnrolled(false)
   → setUserRating(0)
   → Button changes to "Enroll Now"
   → Rating section disappears
   ```

#### **Rating Flow**

1. **User clicks on stars** (only if enrolled)

   ```javascript
   handleRatingChange(newRating)
   → Check if enrolled (if not, show alert)
   → ratingAPI.rateCourse(id, newRating)
   → setUserRating(newRating)
   → fetchCourseDetail() // Refresh to show updated average
   ```

2. **Rating updates in real-time:**
   - User's personal rating updates immediately
   - Course average rating recalculates
   - Total ratings count updates

---

## 🔄 Data Flow Diagram

```
USER ACTION: Click "Enroll Now"
    ↓
Frontend: handleEnroll()
    ↓
API Call: POST /enrollment/enroll/:courseId
    ↓
Backend: enrollment.controller.js → enrollInCourse()
    ↓
Database: Create Enrollment document
    {
      user: "user123",
      course: "course456",
      status: "enrolled",
      personalRating: null
    }
    ↓
Response: { enrollment: {...} }
    ↓
Frontend: setIsEnrolled(true)
    ↓
UI Updates:
    - Button changes to "Drop Course"
    - "Rate This Course" section appears
    - Green "Enrolled" badge shows
```

```
USER ACTION: Click 4th star to rate
    ↓
Frontend: handleRatingChange(4)
    ↓
API Call: POST /rating/rate/:courseId { rating: 4 }
    ↓
Backend: rating.controller.js → rateCourse()
    ↓
Database: Update Enrollment
    {
      ...existing fields,
      personalRating: 4  ← Updated
    }
    ↓
Backend: updateCourseAverageRating()
    ↓
Database: Update Course
    {
      ...existing fields,
      avgRating: 4.2,      ← Recalculated
      totalRatings: 15     ← Incremented
    }
    ↓
Frontend: Refresh course data
    ↓
UI Updates:
    - User's stars show 4 filled
    - Course header shows new average (4.2)
    - Total ratings count updates
```

---

## 🎯 Key Concepts

### **Why use Enrollment model for ratings?**

1. **Relationship Tracking**: Ratings are tied to enrollments, not just users
2. **Access Control**: Only enrolled students can rate
3. **Data Integrity**: One rating per enrollment (can't rate multiple times)
4. **Historical Data**: Even if dropped, rating history is preserved

### **Why calculate average instead of storing individual ratings?**

- **Normalized Data**: Personal ratings in Enrollment, aggregate in Course
- **Flexibility**: Can add weighted ratings, time-based ratings, etc.
- **Accuracy**: Always recalculated when ratings change
- **Scalability**: Course model stays lightweight

### **Status Lifecycle**

```
applied → enrolled → completed
                  ↘ dropped
```

- **applied**: User applied but not yet accepted (future feature)
- **enrolled**: Active enrollment
- **completed**: Finished the course
- **dropped**: User withdrew from course

---

## 🧪 Testing the Features

### **Test Enrollment:**

1. Go to a course detail page
2. Click "Enroll Now"
3. Check MongoDB: Should see new Enrollment document
4. Button should change to "Drop Course"
5. Green "Enrolled" badge should appear

### **Test Rating:**

1. Enroll in a course first
2. Scroll to "Rate This Course" section
3. Click on stars (try different ratings)
4. Check MongoDB: Enrollment should have `personalRating`
5. Check Course: `avgRating` and `totalRatings` should update
6. Refresh page: Rating should persist

### **Test Drop:**

1. While enrolled, click "Drop Course"
2. Confirm the dialog
3. Check MongoDB: Enrollment status should be "dropped"
4. Rating section should disappear
5. Button should change back to "Enroll Now"

---

## 🚀 Future Enhancements

1. **Reviews**: Add text reviews alongside ratings
2. **Rating Breakdown**: Show distribution (how many 5-star, 4-star, etc.)
3. **Verified Ratings**: Only allow ratings after course completion
4. **Edit/Delete**: Allow users to edit or remove their ratings
5. **Dashboard**: Show all enrolled courses with progress bars
6. **Notifications**: Alert when enrolled in a course

---

## 📝 Summary

- **Enrollment Model** is the central piece connecting users and courses
- **Ratings** are stored per enrollment (personalRating field)
- **Course average** is calculated from all enrollment ratings
- **Frontend** uses three API groups: course, enrollment, rating
- **UI** dynamically shows/hides features based on enrollment status
- **Data flow** is unidirectional: User → Frontend → API → Database → Response → UI Update

You now have a fully functional enrollment and rating system! 🎉
