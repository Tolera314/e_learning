/*
  Warnings:

  - You are about to drop the column `description` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `target_segment` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `lessons` table. All the data in the column will be lost.
  - Added the required column `category` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `short_description` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module_id` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_course_id_fkey";

-- DropIndex
DROP INDEX "courses_target_segment_idx";

-- DropIndex
DROP INDEX "lessons_course_id_idx";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "description",
DROP COLUMN "status",
DROP COLUMN "target_segment",
ADD COLUMN     "allow_discussions" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allow_reviews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "discount_price" DECIMAL(65,30),
ADD COLUMN     "full_description" TEXT,
ADD COLUMN     "is_free" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "issue_certificate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "level" TEXT NOT NULL DEFAULT 'Beginner',
ADD COLUMN     "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "short_description" TEXT NOT NULL,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "target_audience" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "visibility" "CourseStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "course_id",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "is_free_preview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_id" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'VIDEO',
ALTER COLUMN "video_url" DROP NOT NULL,
ALTER COLUMN "duration_seconds" DROP NOT NULL;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "duration_minutes" INTEGER;

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "is_collaborative" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "refresh_token_expires" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gender" TEXT,
    "dob" TIMESTAMP(3),
    "region" TEXT,
    "education_level" "AcademicSegment",
    "current_grade" TEXT,
    "university_name" TEXT,
    "field_of_study" TEXT,
    "year_of_study" INTEGER,
    "subjects_of_interest" TEXT[],
    "parent_name" TEXT,
    "parent_phone" TEXT,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gender" TEXT,
    "country" TEXT DEFAULT 'Ethiopia',
    "highest_education" TEXT,
    "teaching_experience" INTEGER,
    "bio" TEXT,
    "degree_url" TEXT,
    "id_url" TEXT,
    "subjects" TEXT[],
    "live_availability" BOOLEAN NOT NULL DEFAULT false,
    "language_preference" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "instructor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_sessions" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "meeting_url" TEXT,
    "recording_url" TEXT,
    "is_live" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "live_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT,
    "exam_id" TEXT,
    "text" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_tests" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration_minutes" INTEGER NOT NULL,

    CONSTRAINT "exam_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_session_attendance" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "live_session_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "live_session_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_id" TEXT NOT NULL,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_annotations" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'yellow',
    "selection_range" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_comments" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_activity_logs" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT,
    "action" TEXT NOT NULL,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_session_chat_logs" (
    "id" TEXT NOT NULL,
    "live_session_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_session_chat_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_performance_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack_trace" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_performance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_stream_metrics" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "buffering_events" INTEGER NOT NULL DEFAULT 0,
    "average_bitrate" INTEGER,
    "playback_errors" INTEGER NOT NULL DEFAULT 0,
    "total_watch_time" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_stream_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "max_points" INTEGER NOT NULL DEFAULT 100,
    "allowed_file_types" TEXT[] DEFAULT ARRAY['pdf', 'docx', 'zip']::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "original_name" TEXT,
    "file_size" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "grade" INTEGER,
    "feedback" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "graded_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_threads" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_announcement" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussion_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_replies" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussion_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_reactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "thread_id" TEXT,
    "reply_id" TEXT,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_follows" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "target_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_profiles_user_id_key" ON "instructor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "modules_course_id_idx" ON "modules"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "live_sessions_lesson_id_key" ON "live_sessions"("lesson_id");

-- CreateIndex
CREATE INDEX "student_activity_logs_student_id_course_id_created_at_idx" ON "student_activity_logs"("student_id", "course_id", "created_at");

-- CreateIndex
CREATE INDEX "live_session_chat_logs_live_session_id_created_at_idx" ON "live_session_chat_logs"("live_session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_lesson_id_key" ON "assignments"("lesson_id");

-- CreateIndex
CREATE INDEX "assignment_submissions_assignment_id_idx" ON "assignment_submissions"("assignment_id");

-- CreateIndex
CREATE INDEX "assignment_submissions_student_id_idx" ON "assignment_submissions"("student_id");

-- CreateIndex
CREATE INDEX "discussion_threads_course_id_idx" ON "discussion_threads"("course_id");

-- CreateIndex
CREATE INDEX "discussion_threads_author_id_idx" ON "discussion_threads"("author_id");

-- CreateIndex
CREATE INDEX "discussion_replies_thread_id_idx" ON "discussion_replies"("thread_id");

-- CreateIndex
CREATE INDEX "discussion_replies_author_id_idx" ON "discussion_replies"("author_id");

-- CreateIndex
CREATE INDEX "discussion_replies_parent_id_idx" ON "discussion_replies"("parent_id");

-- CreateIndex
CREATE INDEX "discussion_reactions_user_id_idx" ON "discussion_reactions"("user_id");

-- CreateIndex
CREATE INDEX "discussion_reactions_thread_id_idx" ON "discussion_reactions"("thread_id");

-- CreateIndex
CREATE INDEX "discussion_reactions_reply_id_idx" ON "discussion_reactions"("reply_id");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_reactions_user_id_thread_id_type_key" ON "discussion_reactions"("user_id", "thread_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_reactions_user_id_reply_id_type_key" ON "discussion_reactions"("user_id", "reply_id", "type");

-- CreateIndex
CREATE INDEX "discussion_follows_user_id_idx" ON "discussion_follows"("user_id");

-- CreateIndex
CREATE INDEX "discussion_follows_thread_id_idx" ON "discussion_follows"("thread_id");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_follows_user_id_thread_id_key" ON "discussion_follows"("user_id", "thread_id");

-- CreateIndex
CREATE INDEX "moderation_logs_admin_id_idx" ON "moderation_logs"("admin_id");

-- CreateIndex
CREATE INDEX "moderation_logs_target_id_idx" ON "moderation_logs"("target_id");

-- CreateIndex
CREATE INDEX "courses_visibility_deleted_at_idx" ON "courses"("visibility", "deleted_at");

-- CreateIndex
CREATE INDEX "enrollments_course_id_idx" ON "enrollments"("course_id");

-- CreateIndex
CREATE INDEX "lesson_progress_lesson_id_idx" ON "lesson_progress"("lesson_id");

-- CreateIndex
CREATE INDEX "lessons_module_id_idx" ON "lessons"("module_id");

-- CreateIndex
CREATE INDEX "quiz_submissions_quiz_id_idx" ON "quiz_submissions"("quiz_id");

-- CreateIndex
CREATE INDEX "subscriptions_student_id_expires_at_idx" ON "subscriptions"("student_id", "expires_at");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_profiles" ADD CONSTRAINT "instructor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam_tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_tests" ADD CONSTRAINT "exam_tests_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session_attendance" ADD CONSTRAINT "live_session_attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session_attendance" ADD CONSTRAINT "live_session_attendance_live_session_id_fkey" FOREIGN KEY ("live_session_id") REFERENCES "live_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "quiz_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_annotations" ADD CONSTRAINT "reading_annotations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_annotations" ADD CONSTRAINT "reading_annotations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_comments" ADD CONSTRAINT "reading_comments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_comments" ADD CONSTRAINT "reading_comments_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_comments" ADD CONSTRAINT "reading_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "reading_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_activity_logs" ADD CONSTRAINT "student_activity_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_activity_logs" ADD CONSTRAINT "student_activity_logs_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session_chat_logs" ADD CONSTRAINT "live_session_chat_logs_live_session_id_fkey" FOREIGN KEY ("live_session_id") REFERENCES "live_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_session_chat_logs" ADD CONSTRAINT "live_session_chat_logs_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_stream_metrics" ADD CONSTRAINT "video_stream_metrics_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_stream_metrics" ADD CONSTRAINT "video_stream_metrics_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_threads" ADD CONSTRAINT "discussion_threads_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_threads" ADD CONSTRAINT "discussion_threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "discussion_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "discussion_replies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reactions" ADD CONSTRAINT "discussion_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reactions" ADD CONSTRAINT "discussion_reactions_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "discussion_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reactions" ADD CONSTRAINT "discussion_reactions_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "discussion_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_follows" ADD CONSTRAINT "discussion_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_follows" ADD CONSTRAINT "discussion_follows_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "discussion_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
