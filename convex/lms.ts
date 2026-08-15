import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

// ─── ADMIN CONFIGURATION ──────────────────────────────────────────────────
const DEFAULT_ADMIN_EMAILS = [
  "reddysantosh1310@gmail.com",
  "suchandramanne@gmail.com",
];

const ADMIN_EMAILS = Array.from(
  new Set([
    ...DEFAULT_ADMIN_EMAILS,
    ...(
      process.env.ADMIN_EMAILS ||
      process.env.ADMIN_EMAIL ||
      process.env.VITE_ADMIN_EMAILS ||
      process.env.VITE_ADMIN_EMAIL ||
      ""
    )
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  ])
);

export const isAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(normalizeEmail(email) || "");
};

function getAuditEmail(fallback?: string): string {
  return normalizeEmail(fallback) || ADMIN_EMAILS[0];
}

// ─── AUTHENTICATION & AUTHORIZATION HELPERS ───────────────────────────────

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() || undefined;
}

export async function resolveAuthenticatedStudent(ctx: QueryCtx | MutationCtx, fallbackEmail?: string) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normalizeEmail(identity?.email || fallbackEmail);
  if (!identity && !email) {
    throw new Error("Unauthenticated: Clerk session required");
  }

  if (identity?.subject) {
    const student = await ctx.db
      .query("students")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    if (student) return student;
  }

  if (email) {
    const matches = await ctx.db
      .query("students")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    if (matches.length === 1) return matches[0];
  }

  throw new Error(`Student identity not found for ${email || identity?.subject}`);
}

export async function findStudentByIdentity(ctx: QueryCtx, fallbackEmail?: string) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normalizeEmail(identity?.email || fallbackEmail);
  if (!identity && !email) return null;

  if (identity?.subject) {
    const student = await ctx.db
      .query("students")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    if (student) return student;
  }

  if (email) {
    const matches = await ctx.db
      .query("students")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    if (matches.length === 1) return matches[0];
  }

  return null;
}

export async function bindClerkIdentityToStudent(ctx: MutationCtx, fallbackEmail?: string) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normalizeEmail(identity?.email || fallbackEmail);
  if ((!identity || !identity.subject) && !email) return null;

  const matches = await ctx.db
    .query("students")
    .withIndex("by_email", (q) => q.eq("email", email!))
    .collect();

  if (matches.length === 1) {
    const student = matches[0];
    if (!student.clerkUserId && identity?.subject) {
      await ctx.db.patch(student._id, { clerkUserId: identity.subject });
    }
    return { ...student, clerkUserId: identity?.subject || student.clerkUserId };
  }

  return null;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx, fallbackEmail?: string) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normalizeEmail(identity?.email || fallbackEmail);
  if (!identity && !email) {
    throw new Error("Unauthenticated: Clerk admin session required");
  }
  if (!isAdminEmail(email)) {
    throw new Error("Forbidden: Access restricted to LMS Administrators");
  }
  return identity || ({ email: email || ADMIN_EMAILS[0] } as any);
}

async function assertDayAccessible(
  ctx: QueryCtx | MutationCtx,
  student: { id: string; batchId?: string },
  dayId: string
) {
  const days = await ctx.db
    .query("courseDays")
    .withIndex("by_course", (q) => q.eq("courseId", "python-mastery"))
    .collect();
  const day = days.find((d) => d.id === dayId);

  if (day && day.releaseStatus !== "locked") return;
  if (!student.batchId) throw new Error("Day not released");

  const grants = await ctx.db
    .query("dayAccess")
    .withIndex("by_batch_day", (q) =>
      q.eq("batchId", student.batchId!).eq("dayId", dayId)
    )
    .collect();

  const allowed = grants.some((g) => !g.studentId || g.studentId === student.id);
  if (!allowed) throw new Error("Day not released to your batch");
}

// ─── AUTH MUTATIONS ────────────────────────────────────────────────────────

export const bindClerkIdentity = mutation({
  args: { actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const student = await bindClerkIdentityToStudent(ctx, args.actorEmail);
    return { success: !!student, studentId: student?.id };
  },
});

export const registerStudent = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    collegeName: v.string(),
    university: v.optional(v.string()),
    degree: v.optional(v.string()),
    branch: v.string(),
    currentYear: v.string(),
    graduationYear: v.string(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    linkedinProfile: v.optional(v.string()),
    githubProfile: v.optional(v.string()),
    skills: v.optional(v.string()),
    preferredCourse: v.string(),
    reasonForJoining: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cleanEmail = args.email.trim().toLowerCase();
    const fullName = args.fullName.trim();
    const collegeName = args.collegeName.trim();
    const branch = args.branch.trim();
    const preferredCourse = args.preferredCourse.trim();
    const linkedinProfile = (args.linkedinProfile || "").trim();
    const githubProfile = (args.githubProfile || "").trim();

    if (!fullName) throw new Error("Full name is required");
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error("A valid email address is required");
    }
    if (!collegeName) throw new Error("College name is required");
    if (!branch) throw new Error("Branch / department is required");
    if (!preferredCourse) throw new Error("Course selection is required");
    if (linkedinProfile && !/^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(linkedinProfile)) {
      throw new Error("Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username)");
    }
    if (githubProfile && !/^https?:\/\/(www\.)?github\.com\/.*$/i.test(githubProfile)) {
      throw new Error("Please enter a valid GitHub profile URL (e.g. https://github.com/username)");
    }

    const existing = await ctx.db
      .query("students")
      .withIndex("by_email", (q) => q.eq("email", cleanEmail))
      .first();

    const identity = await ctx.auth.getUserIdentity();
    const actorEmail = normalizeEmail(identity?.email || args.actorEmail);
    if (actorEmail && actorEmail !== cleanEmail) {
      throw new Error("Registration email must match your account email");
    }

    if (existing) {
      return { success: true, message: "Student already registered" };
    }

    const studentId = "std-" + Date.now();
    const registeredAt = new Date().toISOString();
    const clerkUserId = actorEmail === cleanEmail ? identity?.subject : undefined;

    const studentDoc = {
      id: studentId,
      email: cleanEmail,
      clerkUserId,
      fullName: fullName,
      phone: args.phone.trim(),
      collegeName: collegeName,
      university: (args.university || "").trim(),
      degree: (args.degree || "").trim(),
      branch: branch,
      currentYear: args.currentYear,
      graduationYear: args.graduationYear,
      city: (args.city || "").trim(),
      state: (args.state || "").trim(),
      linkedinProfile: linkedinProfile,
      githubProfile: githubProfile,
      skills: (args.skills || "").trim(),
      preferredCourse: preferredCourse,
      reasonForJoining: (args.reasonForJoining || "").trim(),
      resumeUrl: (args.resumeUrl || "").trim(),
      status: "Pending",
      role: "student",
      progress: { [preferredCourse]: 0 },
      completedLessons: [],
      registeredAt,
    };

    await ctx.db.insert("students", studentDoc);

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: registeredAt,
      userId: studentId,
      userName: args.fullName,
      userEmail: cleanEmail,
      role: "Student",
      action: "Student Registered",
      details: `New registration for ${args.fullName} (${cleanEmail})`,
    });

    return { success: true, student: studentDoc };
  },
});

// ─── STUDENT QUERIES & MUTATIONS ───────────────────────────────────────────

export const getMyStudentContext = query({
  args: { actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const student = await findStudentByIdentity(ctx, args.actorEmail);
    const announcements = await ctx.db.query("announcements").collect();
    const configDoc = await ctx.db.query("config").first();
    const batches = await ctx.db.query("batches").collect();

    const defaultConfig = configDoc || {
      instituteName: "Kriora LMS Portal",
      contactEmail: "director@kriora.io",
      allowSelfRegistration: true,
      dailyAssessmentMarks: 10,
      dailyPerfThreshold: 70,
      finalExamThreshold: 80,
      testDurationMinutes: 60,
    };

    if (!student) {
      return {
        student: null,
        batch: null,
        batches,
        dayAccessGrants: [],
        submissions: [],
        announcements,
        config: defaultConfig,
      };
    }

    let batch = null;
    let dayAccessGrants: any[] = [];
    if (student.batchId) {
      batch = await ctx.db
        .query("batches")
        .withIndex("by_custom_id", (q) => q.eq("id", student.batchId!))
        .first();

      dayAccessGrants = await ctx.db
        .query("dayAccess")
        .withIndex("by_batch", (q) => q.eq("batchId", student.batchId!))
        .collect();

      dayAccessGrants = dayAccessGrants.filter(
        (g) => !g.studentId || g.studentId === student.id
      );
    }

    const submissions = await ctx.db
      .query("testSubmissions")
      .withIndex("by_student", (q) => q.eq("studentId", student.id))
      .collect();

    return {
      student,
      batch,
      batches,
      dayAccessGrants,
      submissions,
      announcements,
      config: defaultConfig,
    };
  },
});

export const updateLessonProgress = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    courseId: v.string(),
    topicId: v.string(),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const student = await resolveAuthenticatedStudent(ctx, args.actorEmail);

    const days = await ctx.db
      .query("courseDays")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    const day = days.find((d) => (d.topics || []).some((t: any) => t.id === args.topicId));
    if (!day) throw new Error("Topic not found in course");
    await assertDayAccessible(ctx, student, day.id);

    let completed: string[] = student.completedLessons || [];
    if (args.isCompleted) {
      if (!completed.includes(args.topicId)) completed.push(args.topicId);
    } else {
      completed = completed.filter((id: string) => id !== args.topicId);
    }

    const ts = new Date().toISOString();
    await ctx.db.patch(student._id, {
      completedLessons: completed,
      lastActive: ts,
    });

    return { success: true, completedLessons: completed };
  },
});

// ─── COURSE & DECOMPOSED CURRICULUM QUERIES ────────────────────────────────

export const getCourseMetadata = query({
  args: { courseId: v.optional(v.string()), actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const targetId = args.courseId || "python-mastery";

    const course = await ctx.db
      .query("courses")
      .withIndex("by_custom_id", (q) => q.eq("id", targetId))
      .first();

    const modules = await ctx.db
      .query("courseModules")
      .withIndex("by_course", (q) => q.eq("courseId", targetId))
      .collect();

    const days = await ctx.db
      .query("courseDays")
      .withIndex("by_course", (q) => q.eq("courseId", targetId))
      .collect();

    if (course && modules.length > 0) {
      modules.sort((a, b) => a.order - b.order);
      days.sort((a, b) => a.dayNumber - b.dayNumber);

      const identity = await ctx.auth.getUserIdentity();
      const isAdmin = isAdminEmail(identity?.email || args.actorEmail);

      let visibleDays = days;
      if (!isAdmin) {
        let student: any = null;
        try { student = await resolveAuthenticatedStudent(ctx, args.actorEmail); } catch {}
        const grants = student?.batchId
          ? await ctx.db
              .query("dayAccess")
              .withIndex("by_batch", (q) => q.eq("batchId", student.batchId))
              .collect()
          : [];
        visibleDays = days.map((d) => {
          const released = d.releaseStatus !== "locked";
          const granted = grants.some(
            (g) => g.dayId === d.id && (!g.studentId || g.studentId === student.id)
          );
          const accessible = released || granted;
          if (!student || !accessible) {
            return { ...d, topics: [] };
          }
          return d;
        });
      }

      const assembledModules = modules.map((m) => ({
        ...m,
        days: visibleDays.filter((d) => d.moduleId === m.id),
      }));

      return {
        course: {
          ...course,
          modules: assembledModules,
        },
        isDecomposed: true,
      };
    }

    if (course) {
      const identity = await ctx.auth.getUserIdentity();
      const isAdmin = isAdminEmail(identity?.email || args.actorEmail);
      const rawModules: any[] = Array.isArray((course as any).modules)
        ? (course as any).modules
        : [];
      const shellModules = rawModules.map((m: any) => ({
        ...m,
        days: Array.isArray(m.days)
          ? m.days.map((d: any) => ({ ...d, topics: [] }))
          : [],
      }));
      return {
        course: { ...course, modules: isAdmin ? rawModules : shellModules },
        isDecomposed: false,
      };
    }
    return { course, isDecomposed: false };
  },
});

export const getDayContent = query({
  args: { dayId: v.string(), actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const isAdmin = isAdminEmail(identity?.email || args.actorEmail);
    if (!isAdmin) {
      const student = await resolveAuthenticatedStudent(ctx, args.actorEmail);
      await assertDayAccessible(ctx, student, args.dayId);
    }

    const record = await ctx.db
      .query("dayContent")
      .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
      .first();

    return record ? record.content : null;
  },
});

export const saveDayContent = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    dayId: v.string(),
    courseId: v.optional(v.string()),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);
    const existing = await ctx.db
      .query("dayContent")
      .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
      .first();

    const courseId = args.courseId || "python-mastery";

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
      });
    } else {
      await ctx.db.insert("dayContent", {
        dayId: args.dayId,
        courseId,
        content: args.content,
      });
    }

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: "Day Content Saved",
      details: `Generated lesson content saved for ${args.dayId}`,
    });

    return { success: true, dayId: args.dayId };
  },
});

// ─── BATCH & DAY RELEASE MANAGEMENT (ADMIN) ───────────────────────────────

export const saveBatch = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    id: v.optional(v.string()),
    name: v.string(),
    courseId: v.string(),
    capacity: v.number(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    daysOfWeek: v.array(v.string()),
    status: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);
    const ts = new Date().toISOString();

    if (args.id) {
      const existing = await ctx.db
        .query("batches")
        .withIndex("by_custom_id", (q) => q.eq("id", args.id!))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: args.name,
          capacity: args.capacity,
          startDate: args.startDate,
          endDate: args.endDate || "",
          startTime: args.startTime,
          endTime: args.endTime,
          daysOfWeek: args.daysOfWeek,
          status: args.status,
          description: args.description || "",
        });
        return { success: true, batchId: args.id };
      }
    }

    const batchId = args.id || "batch-" + Date.now();
    const batchDoc = {
      id: batchId,
      name: args.name,
      courseId: args.courseId,
      capacity: args.capacity,
      startDate: args.startDate,
      endDate: args.endDate || "",
      startTime: args.startTime,
      endTime: args.endTime,
      daysOfWeek: args.daysOfWeek,
      status: args.status,
      description: args.description || "",
      createdAt: ts,
    };

    await ctx.db.insert("batches", batchDoc);

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: ts,
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: args.id ? "Batch Updated" : "Batch Created",
      details: `Batch ${args.name} (${batchId})`,
    });

    return { success: true, batchId };
  },
});

export const enrollStudentInBatch = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    studentId: v.string(),
    batchId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const student = await ctx.db
      .query("students")
      .withIndex("by_custom_id", (q) => q.eq("id", args.studentId))
      .first();

    if (!student) throw new Error("Student not found");
    if (student.batchId === args.batchId) {
      return { success: true, message: "Student already in batch" };
    }

    const batch = await ctx.db
      .query("batches")
      .withIndex("by_custom_id", (q) => q.eq("id", args.batchId))
      .first();

    if (!batch) throw new Error("Batch not found");

    const existingMembers = await ctx.db
      .query("students")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .collect();

    if (existingMembers.length >= (batch.capacity || 5)) {
      throw new Error(`Batch ${batch.name} is at maximum capacity (${batch.capacity || 5})`);
    }

    await ctx.db.patch(student._id, { batchId: args.batchId });

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: "Student Enrolled in Batch",
      details: `Assigned ${student.fullName} (${student.id}) to batch ${batch.name}`,
    });

    return { success: true };
  },
});

export const releaseDayToBatch = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    batchId: v.string(),
    courseId: v.string(),
    dayId: v.string(),
    dayNumber: v.optional(v.number()),
    studentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    let dayNumber = args.dayNumber;
    if (dayNumber === undefined) {
      const days = await ctx.db
        .query("courseDays")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect();
      dayNumber = days.find((d) => d.id === args.dayId)?.dayNumber;
    }

    const existing = await ctx.db
      .query("dayAccess")
      .withIndex("by_batch_day", (q) =>
        q.eq("batchId", args.batchId).eq("dayId", args.dayId)
      )
      .collect();

    const alreadyGranted = existing.some(
      (a) => (a.studentId || undefined) === (args.studentId || undefined)
    );

    if (alreadyGranted) {
      return { success: true, message: "Day already released" };
    }

    const accessId = "acc-" + Date.now();
    const accessDoc = {
      id: accessId,
      batchId: args.batchId,
      courseId: args.courseId,
      dayId: args.dayId,
      dayNumber,
      studentId: args.studentId,
      grantedBy: "admin",
      grantedAt: new Date().toISOString(),
    };

    await ctx.db.insert("dayAccess", accessDoc);

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: "Day Released to Batch",
      details: `Released Day ${dayNumber} (${args.dayId}) for batch ${args.batchId}`,
    });

    return { success: true, access: accessDoc };
  },
});

// ─── ASSESSMENT & SUBMISSION MUTATIONS ────────────────────────────────────

export const submitAssessmentCode = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    dayId: v.string(),
    dayNumber: v.number(),
    testId: v.string(),
    testType: v.string(),
    code: v.string(),
    evalResults: v.optional(v.any()),
    evalError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const student = await resolveAuthenticatedStudent(ctx, args.actorEmail);
    if (!student.batchId) throw new Error("Student not assigned to a batch");
    await assertDayAccessible(ctx, student, args.dayId);

    const ts = new Date().toISOString();

    const existing = await ctx.db
      .query("testSubmissions")
      .withIndex("by_student_test", (q) =>
        q.eq("studentId", student.id).eq("testId", args.testId)
      )
      .first();

    const configDoc = await ctx.db.query("config").first();
    const maxScore = args.testType === "final" ? 100 : configDoc?.dailyAssessmentMarks || 10;

    const results =
      args.evalResults && Array.isArray(args.evalResults) && args.evalResults.length > 0
        ? (args.evalResults as { input?: string; expected?: string; actual?: string; pass?: boolean }[])
        : null;

    const auto =
      results === null
        ? null
        : (() => {
            const passed = results.filter((r) => r.pass).length;
            const total = results.length;
            const failed = total - passed;
            const percentage = Math.round((passed / total) * 100);
            const score = Math.round((passed / total) * maxScore);
            const feedback = args.evalError
              ? args.evalError.slice(0, 500)
              : `${passed} of ${total} test case${total === 1 ? "" : "s"} passed (${percentage}%).`;
            return { passed, total, failed, percentage, score, feedback };
          })();

    const finalEvalStatus = auto ? "auto" : "pending";
    let subId = existing?.id || "sub-" + Date.now();

    if (existing) {
      if (existing.evalStatus === "manual") {
        throw new Error("Submission has already been graded by an instructor and is locked.");
      }
      await ctx.db.patch(existing._id, {
        code: args.code,
        submittedAt: ts,
        ...(auto
          ? {
              score: auto.score,
              percentage: auto.percentage,
              passedTests: auto.passed,
              failedTests: auto.failed,
              evalStatus: finalEvalStatus,
              feedback: auto.feedback,
              evalDetails: { results: args.evalResults, evalError: args.evalError },
              gradedAt: ts,
              gradedBy: "system",
            }
          : { evalStatus: "pending" }),
      });
    } else {
      await ctx.db.insert("testSubmissions", {
        id: subId,
        studentId: student.id,
        batchId: student.batchId,
        courseId: "python-mastery",
        dayId: args.dayId,
        dayNumber: args.dayNumber,
        testId: args.testId,
        testType: args.testType,
        code: args.code,
        maxScore,
        submittedAt: ts,
        ...(auto
          ? {
              score: auto.score,
              percentage: auto.percentage,
              passedTests: auto.passed,
              failedTests: auto.failed,
              evalStatus: finalEvalStatus,
              feedback: auto.feedback,
              evalDetails: { results: args.evalResults, evalError: args.evalError },
              gradedAt: ts,
              gradedBy: "system",
            }
          : { evalStatus: "pending" }),
      });
    }

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: ts,
      userId: student.id,
      userName: student.fullName || student.email,
      userEmail: student.email,
      role: "Student",
      action: auto ? "Assessment Auto-Graded" : "Test Submitted",
      details: `${args.testType} assessment for Day ${args.dayNumber} (${args.testId})${
        auto ? ` — ${auto.passed}/${auto.total} tests passed (${auto.percentage}%)` : ""
      }`,
    });

    return {
      success: true,
      submissionId: subId,
      evalStatus: auto ? "auto" : "pending",
      score: auto?.score,
      maxScore,
      percentage: auto?.percentage,
      passedTests: auto?.passed,
      failedTests: auto?.failed,
      evalResults: args.evalResults,
    };
  },
});

export const gradeSubmission = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    submissionId: v.string(),
    score: v.number(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const sub = await ctx.db
      .query("testSubmissions")
      .withIndex("by_custom_id", (q) => q.eq("id", args.submissionId))
      .first();

    if (!sub) throw new Error("Submission not found");

    const score = Math.min(Math.max(0, args.score), sub.maxScore || args.score);
    const percentage = Math.round((score / (sub.maxScore || 10)) * 100);
    const ts = new Date().toISOString();

    await ctx.db.patch(sub._id, {
      score,
      percentage,
      feedback: args.feedback || "",
      evalStatus: "manual",
      gradedBy: getAuditEmail(args.actorEmail),
      gradedAt: ts,
    });

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: ts,
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: "Submission Graded",
      details: `Graded submission ${args.submissionId} for student ${sub.studentId} — Score: ${score}/${sub.maxScore || 10}`,
    });

    return { success: true };
  },
});

// ─── ADMIN DASHBOARD DATA ─────────────────────────────────────────────────

export const getAdminDashboardData = query({
  args: { actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const [students, batches, dayAccess, testSubmissions, announcements, configDoc] =
      await Promise.all([
        ctx.db.query("students").collect(),
        ctx.db.query("batches").collect(),
        ctx.db.query("dayAccess").collect(),
        ctx.db.query("testSubmissions").collect(),
        ctx.db.query("announcements").collect(),
        ctx.db.query("config").first(),
      ]);

    const auditLogs = await ctx.db.query("auditLogs").order("desc").take(50);

    return {
      students,
      batches,
      dayAccess,
      testSubmissions,
      announcements,
      auditLogs,
      config: configDoc || {
        instituteName: "Kriora LMS Portal",
        contactEmail: "director@kriora.io",
        allowSelfRegistration: true,
        dailyAssessmentMarks: 10,
        dailyPerfThreshold: 70,
        finalExamThreshold: 80,
        testDurationMinutes: 60,
      },
    };
  },
});

export const studentAdminAction = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    studentId: v.string(),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const student = await ctx.db
      .query("students")
      .withIndex("by_custom_id", (q) => q.eq("id", args.studentId))
      .first();

    if (!student) throw new Error("Student record not found");

    const ts = new Date().toISOString();

    if (args.action === "delete") {
      await ctx.db.delete(student._id);
    } else {
      let newStatus = student.status;
      if (args.action === "approve") newStatus = "Approved";
      if (args.action === "reject") newStatus = "Rejected";
      if (args.action === "suspend") newStatus = "Suspended";
      if (args.action === "activate") newStatus = "Approved";

      await ctx.db.patch(student._id, { status: newStatus });
    }

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: ts,
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: `Student ${args.action.toUpperCase()}`,
      details: `${args.action} action on student ${student.fullName} (${student.email})`,
    });

    return { success: true };
  },
});

export const saveLMSConfig = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    instituteName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    allowSelfRegistration: v.optional(v.boolean()),
    dailyAssessmentMarks: v.optional(v.number()),
    dailyPerfThreshold: v.optional(v.number()),
    finalExamThreshold: v.optional(v.number()),
    testDurationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const existing = await ctx.db.query("config").first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
    } else {
      await ctx.db.insert("config", {
        instituteName: args.instituteName || "Kriora LMS Portal",
        contactEmail: args.contactEmail || "director@kriora.io",
        allowSelfRegistration: args.allowSelfRegistration ?? true,
        dailyAssessmentMarks: args.dailyAssessmentMarks || 10,
        dailyPerfThreshold: args.dailyPerfThreshold || 70,
        finalExamThreshold: args.finalExamThreshold || 80,
        testDurationMinutes: args.testDurationMinutes || 60,
      });
    }

    return { success: true };
  },
});

export const upsertAnnouncement = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    id: v.optional(v.string()),
    title: v.string(),
    content: v.string(),
    author: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);
    const ts = new Date().toISOString();

    if (args.id) {
      const existing = await ctx.db
        .query("announcements")
        .withIndex("by_custom_id", (q) => q.eq("id", args.id!))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: args.title,
          content: args.content,
          author: args.author || existing.author,
          isPinned: !!args.isPinned,
        });
        return { success: true };
      }
    }

    await ctx.db.insert("announcements", {
      id: args.id || "ann-" + Date.now(),
      title: args.title,
      content: args.content,
      author: args.author || "Director Admin",
      publishedAt: ts,
      isPinned: !!args.isPinned,
    });

    return { success: true };
  },
});

export const deleteAnnouncement = mutation({
  args: { actorEmail: v.optional(v.string()), id: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const existing = await ctx.db
      .query("announcements")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return { success: true };
  },
});

export const deleteBatch = mutation({
  args: { actorEmail: v.optional(v.string()), batchId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const batch = await ctx.db
      .query("batches")
      .withIndex("by_custom_id", (q) => q.eq("id", args.batchId))
      .first();
    if (batch) await ctx.db.delete(batch._id);

    const members = await ctx.db
      .query("students")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .collect();
    for (const s of members) await ctx.db.patch(s._id, { batchId: undefined });

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: "Batch Deleted",
      details: `Deleted batch ${args.batchId}, unassigned ${members.length} student(s)`,
    });

    return { success: true };
  },
});

export const setStudentBatch = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    studentId: v.string(),
    batchId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const student = await ctx.db
      .query("students")
      .withIndex("by_custom_id", (q) => q.eq("id", args.studentId))
      .first();
    if (!student) throw new Error("Student not found");

    const ts = new Date().toISOString();

    if (!args.batchId) {
      await ctx.db.patch(student._id, { batchId: undefined });
      await ctx.db.insert("auditLogs", {
        id: "log-" + Date.now(),
        timestamp: ts,
        userId: "admin-core",
        userName: "Director Admin",
        userEmail: getAuditEmail(args.actorEmail),
        role: "Admin",
        action: "Student Removed from Batch",
        details: `Removed ${student.fullName} (${student.id}) from batch`,
      });
      return { success: true };
    }

    const batch = await ctx.db
      .query("batches")
      .withIndex("by_custom_id", (q) => q.eq("id", args.batchId))
      .first();
    if (!batch) throw new Error("Batch not found");

    const members = await ctx.db
      .query("students")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .collect();
    if (members.length >= (batch.capacity || 5) && student.batchId !== args.batchId) {
      throw new Error(`Batch ${batch.name} is at maximum capacity (${batch.capacity || 5})`);
    }

    await ctx.db.patch(student._id, { batchId: args.batchId });

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: ts,
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: "Student Transferred",
      details: `Moved ${student.fullName} (${student.id}) to batch ${args.batchId}`,
    });

    return { success: true };
  },
});

export const lockDayForBatch = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    batchId: v.string(),
    dayId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const grants = await ctx.db
      .query("dayAccess")
      .withIndex("by_batch_day", (q) =>
        q.eq("batchId", args.batchId).eq("dayId", args.dayId)
      )
      .collect();
    for (const g of grants) await ctx.db.delete(g._id);

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: "Day Locked for Batch",
      details: `Revoked ${args.dayId} for batch ${args.batchId} (${grants.length} grant(s))`,
    });

    return { success: true };
  },
});

// ─── CONVEX SERVERLESS AI ENGINE ──────────────────────────────────────────

async function generateConvexAI(opts: {
  system?: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"];
    const contents = opts.messages.map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const systemInstruction = opts.system ? { parts: [{ text: opts.system }] } : undefined;

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              ...(systemInstruction ? { systemInstruction } : {}),
              generationConfig: {
                temperature: opts.temperature ?? 0.7,
                ...(opts.jsonMode ? { responseMimeType: "application/json" } : {}),
              },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      } catch (err) {
        console.warn(`[Convex AI] Gemini ${model} failed:`, err);
      }
    }
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  if (openrouterKey) {
    const models = ["openrouter/free", "google/gemini-2.0-flash-lite-preview-02-05:free", "meta-llama/llama-3.3-70b-instruct"];
    const messages = opts.system
      ? [{ role: "system", content: opts.system }, ...opts.messages]
      : opts.messages;

    for (const model of models) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openrouterKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: opts.temperature ?? 0.7,
            ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) return text;
        }
      } catch (err) {
        console.warn(`[Convex AI] OpenRouter ${model} failed:`, err);
      }
    }
  }

  throw new Error("AI generation services are currently unavailable. Please verify API configuration.");
}

export const adminCopilotChat = action({
  args: {
    message: v.string(),
    actorEmail: v.optional(v.string()),
    history: v.optional(
      v.array(
        v.object({
          role: v.string(),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    let livePlatformSummary = "";
    try {
      const adminData: any = await ctx.runQuery(api.lms.getAdminDashboardData, {
        actorEmail: args.actorEmail,
      });

      if (adminData) {
        const students = adminData.students || [];
        const pendingStudents = students.filter(
          (s: any) => (s.status || "").toLowerCase() === "pending"
        );
        const approvedStudents = students.filter(
          (s: any) => (s.status || "").toLowerCase() === "approved"
        );
        const batches = adminData.batches || [];
        const submissions = adminData.testSubmissions || [];
        const announcements = adminData.announcements || [];
        const config = adminData.config || {};

        const avgScore =
          submissions.length > 0
            ? Math.round(
                (submissions.reduce((acc: number, s: any) => acc + (s.score || 0), 0) /
                  submissions.length) *
                  10
              ) / 10
            : "N/A";

        livePlatformSummary = `
REAL-TIME LIVE KRIORA LMS PLATFORM DATA (Current Live Timestamp: ${new Date().toUTCString()}):
- Platform / Institute: ${config.instituteName || "Kriora LMS Portal"}
- Total Registered Students: ${students.length}
- Approved Active Students: ${approvedStudents.length}
- Pending Student Registrations (Awaiting Admin Approval): ${pendingStudents.length}${
          pendingStudents.length > 0
            ? ` [${pendingStudents
                .map((s: any) => `${s.fullName} (${s.email}, Course: ${s.preferredCourse || "Python"})`)
                .join(", ")}]`
            : " (None currently pending)"
        }
- Total LMS Batches: ${batches.length}${
          batches.length > 0
            ? ` [${batches
                .map(
                  (b: any) =>
                    `"${b.name}" (Status: ${b.status}, Enrolled: ${
                      students.filter((s: any) => s.batchId === b.id).length
                    }/${b.capacity || 50}, Schedule: ${b.startTime || "N/A"}-${b.endTime || "N/A"})`
                )
                .join("; ")}]`
            : " (No batches created yet)"
        }
- Published Announcements (${announcements.length}): ${
          announcements.length > 0
            ? announcements.slice(0, 5).map((a: any) => `"${a.title}"`).join(", ")
            : "None"
        }
- Student Test Submissions: ${submissions.length} total assessments submitted (Average Score: ${avgScore}/10)
- Configured Passing Threshold: ${config.dailyPerfThreshold || 70}% (Daily Tasks), ${config.finalExamThreshold || 80}% (Final Exam)
`;
      }
    } catch (dbErr) {
      console.warn("[Admin Copilot] Could not query live admin data:", dbErr);
    }

    const system = `You are the Kriora LMS Admin Copilot with direct, real-time access to the live Convex Cloud database.

${livePlatformSummary || "Live data unavailable."}

CRITICAL RULES:
1. When asked about metrics, pending registrations, batches, students, or platform stats, ALWAYS use the EXACT REAL DATA listed above. Never invent, approximate, or hallucinate fake numbers, placeholder batches, or outdated dates (e.g. 2023).
2. If asked to draft an announcement, write high quality, professional markdown copy ready to broadcast to students.
3. If the user asks to post an announcement, provide the finalized draft and confirm it is ready to be published to all students on Kriora LMS.
4. Keep answers concise, executive, clean, and highly structured with bullet points.`;

    const allMsgs = [...(args.history || []), { role: "user", content: args.message }];
    const text = await generateConvexAI({
      system,
      messages: allMsgs,
      temperature: 0.5,
    });

    return { success: true, text, reply: text };
  },
});

export const studentTutorChat = action({
  args: {
    message: v.string(),
    systemInstruction: v.optional(v.string()),
    history: v.optional(
      v.array(
        v.object({
          role: v.string(),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (_ctx, args) => {
    const system =
      args.systemInstruction ||
      "You are a helpful and patient Python programming tutor for Kriora LMS. Keep explanations clear, encouraging, and focused on learning.";
    const allMsgs = [...(args.history || []), { role: "user", content: args.message }];
    const text = await generateConvexAI({
      system,
      messages: allMsgs,
      temperature: 0.7,
    });
    return { success: true, text };
  },
});

export const evaluateAssessment = action({
  args: {
    code: v.string(),
    dayNumber: v.optional(v.number()),
    dayTitle: v.optional(v.string()),
    taskDescription: v.optional(v.string()),
    maxScore: v.optional(v.number()),
    testType: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const maxScore = args.maxScore ?? 10;
    const prompt = `You are an expert Python programming instructor and evaluator for Kriora LMS.
Evaluate the student's Python code submission fairly, accurately, and thoroughly.

ASSESSMENT CONTEXT:
- Test Type: ${args.testType || "daily"}
- Day Number: ${args.dayNumber ?? "N/A"}
- Topic/Day Title: ${args.dayTitle ?? "Python Assessment"}
- Task / Problem Description: ${args.taskDescription || "Python Daily Coding Assessment"}
- Max Possible Marks: ${maxScore}

STUDENT'S SUBMITTED PYTHON CODE:
\`\`\`python
${args.code}
\`\`\`

EVALUATION RULES:
1. Check valid syntax, indentation, and logic correctness.
2. Award fair marks between 0 and ${maxScore}.
3. Return valid JSON only.

JSON schema:
{
  "score": <number between 0 and ${maxScore}>,
  "percentage": <integer between 0 and 100>,
  "passedTests": <integer>,
  "failedTests": <integer>,
  "feedback": "<constructive feedback string>",
  "evalResults": [
    {
      "input": "<criterion or scenario tested>",
      "expected": "<expected behavior>",
      "actual": "<student's code behavior>",
      "pass": <boolean>
    }
  ]
}`;

    const rawResponse = await generateConvexAI({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      jsonMode: true,
    });

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI evaluation did not return valid JSON");
    const parsed = JSON.parse(jsonMatch[0]);

    const score =
      typeof parsed.score === "number"
        ? Math.min(Math.max(0, Math.round(parsed.score * 10) / 10), maxScore)
        : Math.round(maxScore * 0.8);
    const percentage =
      typeof parsed.percentage === "number"
        ? Math.min(Math.max(0, Math.round(parsed.percentage)), 100)
        : Math.round((score / maxScore) * 100);

    return {
      success: true,
      score,
      maxScore,
      percentage,
      passedTests: parsed.passedTests ?? (percentage >= 70 ? 1 : 0),
      failedTests: parsed.failedTests ?? (percentage >= 70 ? 0 : 1),
      feedback: parsed.feedback || `Scored ${score}/${maxScore} (${percentage}%).`,
      evalResults: parsed.evalResults || [],
    };
  },
});




