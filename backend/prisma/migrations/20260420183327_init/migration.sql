-- CreateEnum
CREATE TYPE "PerformanceLevel" AS ENUM ('AD', 'A', 'B', 'C');

-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('draft', 'published', 'closed');

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_user" UUID,
    "updated_user" UUID,
    "state" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" UUID NOT NULL,
    "hashed_refresh_token" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_user" UUID,
    "updated_user" UUID,
    "state" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacher_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_user" UUID,
    "updated_user" UUID,
    "state" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_student" (
    "id" TEXT NOT NULL,
    "course_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "course_student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "state" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criterion" (
    "id" TEXT NOT NULL,
    "rubric_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL,
    "state" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "rubric_criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criterion_level_descriptor" (
    "id" TEXT NOT NULL,
    "criterion_id" UUID NOT NULL,
    "level" "PerformanceLevel" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "rubric_criterion_level_descriptor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework" (
    "id" TEXT NOT NULL,
    "course_id" UUID NOT NULL,
    "rubric_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_group" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "status" "HomeworkStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "created_user" UUID,
    "updated_user" UUID,
    "state" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_group" (
    "id" TEXT NOT NULL,
    "homework_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "homework_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_group_member" (
    "id" TEXT NOT NULL,
    "group_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,

    CONSTRAINT "homework_group_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" TEXT NOT NULL,
    "homework_id" UUID NOT NULL,
    "student_id" UUID,
    "group_id" UUID,
    "video_url" TEXT NOT NULL,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "review_started_at" TIMESTAMPTZ,
    "review_submitted_at" TIMESTAMPTZ,
    "review_duration_seconds" INTEGER,
    "ai_evaluated_at" TIMESTAMPTZ,
    "teacher_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "state" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_criterion_evaluation" (
    "id" TEXT NOT NULL,
    "submission_id" UUID NOT NULL,
    "criterion_id" UUID NOT NULL,
    "ai_level" "PerformanceLevel",
    "ai_reasoning" TEXT,
    "ai_generated_at" TIMESTAMPTZ,
    "final_level" "PerformanceLevel" NOT NULL,
    "final_reasoning" TEXT NOT NULL,
    "edited_by_teacher" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "submission_criterion_evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "course_student_course_id_student_id_key" ON "course_student"("course_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_criterion_level_descriptor_criterion_id_level_key" ON "rubric_criterion_level_descriptor"("criterion_id", "level");

-- CreateIndex
CREATE UNIQUE INDEX "homework_group_member_group_id_student_id_key" ON "homework_group_member"("group_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_criterion_evaluation_submission_id_criterion_id_key" ON "submission_criterion_evaluation"("submission_id", "criterion_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_student" ADD CONSTRAINT "course_student_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_student" ADD CONSTRAINT "course_student_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric" ADD CONSTRAINT "rubric_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criterion" ADD CONSTRAINT "rubric_criterion_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criterion_level_descriptor" ADD CONSTRAINT "rubric_criterion_level_descriptor_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "rubric_criterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework" ADD CONSTRAINT "homework_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework" ADD CONSTRAINT "homework_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_group" ADD CONSTRAINT "homework_group_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "homework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_group_member" ADD CONSTRAINT "homework_group_member_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "homework_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_group_member" ADD CONSTRAINT "homework_group_member_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "homework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "homework_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_criterion_evaluation" ADD CONSTRAINT "submission_criterion_evaluation_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_criterion_evaluation" ADD CONSTRAINT "submission_criterion_evaluation_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "rubric_criterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
