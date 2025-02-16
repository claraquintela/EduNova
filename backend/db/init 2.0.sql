BEGIN;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS analytics, messages, learning_path_courses, learning_paths, wishlists, assignment_submissions, assignments, notifications, coupon_usage, coupons, certificates, reviews, payments, progress, enrollments, media_files, classes, courses, status, privileges, users, categories CASCADE;

-- Table: privileges (user roles and permissions)
CREATE TABLE IF NOT EXISTS privileges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Table: categories (categories for organizing courses)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Table: users (students, instructors, and admins)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    birthday DATE,
    privilege_id INTEGER REFERENCES privileges(id) ON DELETE SET NULL
);

-- Table: status (for tracking the status of a course, e.g., draft, published)
CREATE TABLE IF NOT EXISTS status (
    id SERIAL PRIMARY KEY,
    name JSONB NOT NULL
);

-- Table: courses (multilingual support for course content)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title JSONB NOT NULL,
    subtitle JSONB NOT NULL,
    description JSONB NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    status_id INTEGER NOT NULL REFERENCES status(id),
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
);

-- Table: classes (individual lessons within courses)
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    title JSONB NOT NULL,
    subtitle JSONB NOT NULL,
    description JSONB NOT NULL,
    video_path TEXT,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: media_files (handling images, documents, or video metadata)
CREATE TABLE IF NOT EXISTS media_files (
    id SERIAL PRIMARY KEY,
    file_type VARCHAR(10) CHECK (file_type IN ('pdf', 'image', 'video')),
    file_path TEXT NOT NULL,
    course_id INTEGER REFERENCES courses(id),
    class_id INTEGER REFERENCES classes(id),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Table: enrollments (track student enrollments in courses)
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    is_paid BOOLEAN DEFAULT FALSE,
    enrolled_at TIMESTAMP DEFAULT NOW()
);

-- Table: progress (track progress of students within a course)
CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    progress_percentage DECIMAL(5, 2),
    last_accessed TIMESTAMP
);

-- Table: payments (tracking course purchases and payments)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')),
    payment_gateway_response JSON,
    payment_date TIMESTAMP DEFAULT NOW()
);

-- Table: reviews (course reviews by students)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: certificates (course completion certificates for students)
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    certificate_url TEXT NOT NULL,
    issued_at TIMESTAMP DEFAULT NOW()
);

-- Table: coupons (discount codes for course purchases)
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage NUMERIC(5, 2) CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    expiration_date TIMESTAMP,
    usage_limit INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: coupon_usage (tracks usage of coupons by users)
CREATE TABLE IF NOT EXISTS coupon_usage (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    used_at TIMESTAMP DEFAULT NOW()
);

-- Table: notifications (user notifications for course updates, reviews, etc.)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,na
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: assignments (assignments or quizzes within classes)
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: assignment_submissions (tracks student submissions for assignments)
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    submission_url TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    grade NUMERIC(5, 2)
);

-- Table: wishlists (wishlist of courses for students)
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW()
);

-- Table: learning_paths (course sequences or learning paths for students)
CREATE TABLE IF NOT EXISTS learning_paths (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: learning_path_courses (associates courses with learning paths)
CREATE TABLE IF NOT EXISTS learning_path_courses (
    id SERIAL PRIMARY KEY,
    learning_path_id INTEGER REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL
);

-- Table: messages (communication between students and instructors)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Table: analytics (track course views, completion, etc., for analysis)
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5, 2) CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    last_accessed TIMESTAMP
);

-- Indexing for better performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_courses_title ON courses((title->>'en'));
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_progress_user_course ON progress(user_id, course_id);

COMMIT;
