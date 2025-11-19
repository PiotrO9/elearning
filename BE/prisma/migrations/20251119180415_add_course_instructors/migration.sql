-- CreateTable
CREATE TABLE "CourseInstructor" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseInstructor_courseId_idx" ON "CourseInstructor"("courseId");

-- CreateIndex
CREATE INDEX "CourseInstructor_userId_idx" ON "CourseInstructor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseInstructor_courseId_userId_key" ON "CourseInstructor"("courseId", "userId");

-- AddForeignKey
ALTER TABLE "CourseInstructor" ADD CONSTRAINT "CourseInstructor_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInstructor" ADD CONSTRAINT "CourseInstructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
