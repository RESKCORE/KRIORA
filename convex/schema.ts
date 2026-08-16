import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Courses & Curriculum ───────────────────────────────────────────────────
  courses: defineTable({
    id: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    level: v.optional(v.string()),
    category: v.optional(v.string()),
    instructor: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    learningOutcomes: v.optional(v.array(v.string())),
    prerequisites: v.optional(v.array(v.string())),
    thumbnailUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    totalDuration: v.optional(v.string()),
    modules: v.optional(v.any()),
  }).index("by_custom_id", ["id"]),

  courseModules: defineTable({
    id: v.string(),
    courseId: v.string(),
    order: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
    dayIds: v.array(v.string()),
  }).index("by_course", ["courseId"]),

  courseDays: defineTable({
    id: v.string(),
    moduleId: v.string(),
    courseId: v.string(),
    dayNumber: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
    releaseStatus: v.optional(v.string()),
    releasedAt: v.optional(v.string()),
    lockedAt: v.optional(v.string()),
    assessmentKey: v.optional(v.string()),
    topics: v.any(),
    estimatedMinutes: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_module", ["moduleId"])
    .index("by_day_number", ["courseId", "dayNumber"]),

  dayContent: defineTable({
    dayId: v.string(),
    courseId: v.string(),
    content: v.any(),
  }).index("by_day", ["dayId"]),

  // ── Students & Auth ────────────────────────────────────────────────────────
  students: defineTable({
    id: v.string(),
    email: v.string(),
    clerkUserId: v.optional(v.string()),
    batchId: v.optional(v.string()),
    status: v.string(),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    collegeName: v.optional(v.string()),
    university: v.optional(v.string()),
    degree: v.optional(v.string()),
    branch: v.optional(v.string()),
    currentYear: v.optional(v.string()),
    graduationYear: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    linkedinProfile: v.optional(v.string()),
    githubProfile: v.optional(v.string()),
    skills: v.optional(v.string()),
    preferredCourse: v.optional(v.string()),
    reasonForJoining: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
    role: v.optional(v.string()),
    progress: v.optional(v.any()),
    completedLessons: v.optional(v.any()),
    lastLogin: v.optional(v.string()),
    lastActive: v.optional(v.string()),
    registeredAt: v.optional(v.string()),
    isEmailVerified: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_batch", ["batchId"])
    .index("by_status", ["status"])
    .index("by_custom_id", ["id"]),

  // ── Batches ────────────────────────────────────────────────────────────────
  batches: defineTable({
    id: v.string(),
    courseId: v.optional(v.string()),
    status: v.optional(v.string()),
    name: v.optional(v.string()),
    capacity: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    daysOfWeek: v.optional(v.any()),
    description: v.optional(v.string()),
    createdAt: v.optional(v.string()),
  })
    .index("by_course", ["courseId"])
    .index("by_status", ["status"])
    .index("by_custom_id", ["id"]),

  // ── Access & Releases ──────────────────────────────────────────────────────
  dayAccess: defineTable({
    id: v.string(),
    batchId: v.string(),
    courseId: v.optional(v.string()),
    dayId: v.string(),
    dayNumber: v.optional(v.number()),
    studentId: v.optional(v.string()),
    grantedBy: v.optional(v.string()),
    grantedAt: v.optional(v.string()),
  })
    .index("by_batch", ["batchId"])
    .index("by_batch_day", ["batchId", "dayId"])
    .index("by_custom_id", ["id"]),

  // ── Submissions & Assessments ──────────────────────────────────────────────
  testSubmissions: defineTable({
    id: v.string(),
    studentId: v.string(),
    batchId: v.optional(v.string()),
    courseId: v.optional(v.string()),
    dayId: v.optional(v.string()),
    dayNumber: v.optional(v.number()),
    testId: v.string(),
    testType: v.string(),
    code: v.optional(v.string()),
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    percentage: v.optional(v.number()),
    submittedAt: v.optional(v.string()),
    evalStatus: v.string(),
    feedback: v.optional(v.string()),
    gradedBy: v.optional(v.string()),
    gradedAt: v.optional(v.string()),
    passedTests: v.optional(v.number()),
    failedTests: v.optional(v.number()),
    evalDetails: v.optional(v.any()),
    graderMode: v.optional(v.string()),
    graderVersion: v.optional(v.string()),
    rubricVersion: v.optional(v.string()),
    evalTimestamp: v.optional(v.string()),
    submissionRequestId: v.optional(v.string()),
  })
    .index("by_student", ["studentId"])
    .index("by_student_test", ["studentId", "testId"])
    .index("by_batch", ["batchId"])
    .index("by_eval_status", ["evalStatus"])
    .index("by_request_id", ["submissionRequestId"])
    .index("by_custom_id", ["id"]),

  // ── Announcements, Audit & Config ──────────────────────────────────────────
  announcements: defineTable({
    id: v.string(),
    title: v.string(),
    content: v.string(),
    author: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    targetBatchId: v.optional(v.string()),
    priority: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
  }).index("by_custom_id", ["id"]),

  auditLogs: defineTable({
    id: v.string(),
    timestamp: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    role: v.optional(v.string()),
    action: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_custom_id", ["id"]),

  config: defineTable(v.any()),
});

