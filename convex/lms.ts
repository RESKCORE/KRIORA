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

export function getAdminAuthorName(email?: string): string {
  const norm = normalizeEmail(email);
  if (norm === "suchandramanne@gmail.com") return "Suchandra Manne (Admin)";
  if (norm === "reddysantosh1310@gmail.com") return "Santosh Reddy (Director Admin)";
  if (norm) return `${norm.split("@")[0]} (Admin)`;
  return "Director Admin";
}

// ─── AUTHENTICATION & AUTHORIZATION HELPERS ───────────────────────────────

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() || undefined;
}

export function isServerAuthorized(serverSecret?: string) {
  return !!(
    serverSecret &&
    process.env.CONVEX_SERVER_SECRET &&
    serverSecret === process.env.CONVEX_SERVER_SECRET
  );
}

export async function resolveAuthenticatedStudent(ctx: QueryCtx | MutationCtx, fallbackEmail?: string, serverSecret?: string) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normalizeEmail(identity?.email || fallbackEmail);
  if (!identity && !email && !isServerAuthorized(serverSecret)) {
    throw new Error("Unauthenticated: Clerk session required");
  }

  // If a session identity is present, ensure caller cannot spoof a different student email
  if (identity?.email && fallbackEmail && normalizeEmail(identity.email) !== normalizeEmail(fallbackEmail)) {
    throw new Error("Forbidden: Session identity does not match supplied email argument");
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

export async function findStudentByIdentity(ctx: QueryCtx, fallbackEmail?: string, serverSecret?: string) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normalizeEmail(identity?.email || fallbackEmail);
  if (!identity && !email && !isServerAuthorized(serverSecret)) return null;

  if (identity?.email && fallbackEmail && normalizeEmail(identity.email) !== normalizeEmail(fallbackEmail)) {
    return null;
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

  return null;
}

export async function bindClerkIdentityToStudent(ctx: MutationCtx, fallbackEmail?: string, serverSecret?: string) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normalizeEmail(identity?.email || fallbackEmail);
  if ((!identity || !identity.subject) && !email && !isServerAuthorized(serverSecret)) return null;

  if (identity?.email && fallbackEmail && normalizeEmail(identity.email) !== normalizeEmail(fallbackEmail)) {
    return null;
  }

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

export async function requireAdmin(ctx: QueryCtx | MutationCtx, fallbackEmail?: string, serverSecret?: string) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normalizeEmail(identity?.email || fallbackEmail);
  
  if (!identity && !fallbackEmail && !isServerAuthorized(serverSecret)) {
    throw new Error("Unauthenticated: Clerk admin session required");
  }

  // If a session identity is present, ensure caller cannot spoof a different admin email
  if (identity?.email && fallbackEmail && normalizeEmail(identity.email) !== normalizeEmail(fallbackEmail)) {
    throw new Error("Forbidden: Session identity does not match supplied email argument");
  }

  if (!email || !isAdminEmail(email)) {
    throw new Error(`Forbidden: Access restricted to LMS Administrators (${email || 'unknown'})`);
  }

  return identity || ({ email, subject: `admin_${email}` } as any);
}

async function assertDayAccessible(
  ctx: QueryCtx | MutationCtx,
  student: { id: string; batchId?: string },
  dayId: string
) {
  // Find the specific day by querying all days for this course and filtering by id
  // (dayId is not indexed directly, but courseDays table is small and static)
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
  args: { actorEmail: v.optional(v.string()), serverSecret: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const student = await findStudentByIdentity(ctx, args.actorEmail, args.serverSecret);
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
  args: { courseId: v.optional(v.string()), actorEmail: v.optional(v.string()), serverSecret: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const targetId = args.courseId || "python-mastery";
    const serverAuthed = isServerAuthorized(args.serverSecret);

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
      const isAdmin = isAdminEmail(identity?.email) || (serverAuthed && isAdminEmail(args.actorEmail));

      let visibleDays = days;
      if (!isAdmin) {
        let student: any = null;
        try { student = await resolveAuthenticatedStudent(ctx, args.actorEmail, args.serverSecret); } catch {}
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
      const isAdmin = isAdminEmail(identity?.email) || (serverAuthed && isAdminEmail(args.actorEmail));
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
  args: { dayId: v.string(), actorEmail: v.optional(v.string()), serverSecret: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const serverAuthed = isServerAuthorized(args.serverSecret);
    const isAdmin = isAdminEmail(identity?.email) || (serverAuthed && isAdminEmail(args.actorEmail));
    if (!isAdmin) {
      const student = await resolveAuthenticatedStudent(ctx, args.actorEmail, args.serverSecret);
      await assertDayAccessible(ctx, student, args.dayId);
    }

    const record = await ctx.db
      .query("dayContent")
      .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
      .first();

    return record ? record.content : null;
  },
});

export function validateDayContentPayload(content: any): any {
  if (!content || typeof content !== "object") {
    throw new Error("Invalid day content: payload must be a valid object");
  }
  const topics = Array.isArray(content.topics) ? content.topics : [];
  if (topics.length === 0) {
    throw new Error("Invalid day content: at least one topic is required");
  }
  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    if (!t || typeof t !== "object" || typeof t.title !== "string" || !t.title.trim()) {
      throw new Error(`Invalid topic at position ${i + 1}: valid title string is required`);
    }
    if (t.codeExamples && !Array.isArray(t.codeExamples)) {
      throw new Error(`Invalid codeExamples at topic position ${i + 1}: must be an array`);
    }
  }

  if (content.workedExample !== undefined) {
    if (typeof content.workedExample !== "object" || content.workedExample === null) {
      throw new Error("Invalid workedExample: must be a valid object");
    }
  }

  if (content.practice !== undefined) {
    if (!Array.isArray(content.practice)) {
      throw new Error("Invalid practice: must be an array of practice items");
    }
  }

  if (content.testCases !== undefined) {
    if (!Array.isArray(content.testCases)) {
      throw new Error("Invalid testCases: must be an array of test cases");
    }
  }

  return content;
}

export const saveDayContent = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    dayId: v.string(),
    courseId: v.optional(v.string()),
    content: v.any(),
    serverSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail, args.serverSecret);
    validateDayContentPayload(args.content);

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
    submissionRequestId: v.optional(v.string()),
    graderMode: v.optional(v.string()),
    graderVersion: v.optional(v.string()),
    rubricVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const student = await resolveAuthenticatedStudent(ctx, args.actorEmail);
    if (!student.batchId) throw new Error("Student not assigned to a batch");
    await assertDayAccessible(ctx, student, args.dayId);

    const ts = new Date().toISOString();

    // ── Idempotency Check: if submissionRequestId matches a recent submission, return existing ──
    if (args.submissionRequestId) {
      const existingByReq = await ctx.db
        .query("testSubmissions")
        .withIndex("by_request_id", (q) => q.eq("submissionRequestId", args.submissionRequestId!))
        .first();

      if (existingByReq && existingByReq.studentId === student.id) {
        return {
          success: true,
          submissionId: existingByReq.id,
          evalStatus: existingByReq.evalStatus,
          score: existingByReq.score,
          maxScore: existingByReq.maxScore,
          percentage: existingByReq.percentage,
          passedTests: existingByReq.passedTests,
          failedTests: existingByReq.failedTests,
          evalResults: existingByReq.evalDetails?.results || [],
          idempotent: true,
        };
      }
    }

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
            const rawPercentage = (passed / total) * 100;
            const rawScore = (passed / total) * maxScore;
            const percentage = Math.min(Math.max(0, Math.round(rawPercentage)), 100);
            const score = Math.min(Math.max(0, Math.round(rawScore * 10) / 10), maxScore);
            const feedback = args.evalError
              ? args.evalError.slice(0, 500)
              : `${passed} of ${total} test case${total === 1 ? "" : "s"} passed (${percentage}%).`;
            return { passed, total, failed, percentage, score, feedback };
          })();

    const finalEvalStatus = auto ? "auto" : "pending";
    const graderMode = args.graderMode || (auto ? "ai-assisted" : "pending");
    const graderVersion = args.graderVersion || "1.3.1";
    const rubricVersion = args.rubricVersion || "v1";
    let subId = existing?.id || "sub-" + Date.now();

    if (existing) {
      if (existing.evalStatus === "manual") {
        throw new Error("Submission has already been graded by an instructor and is locked.");
      }
      await ctx.db.patch(existing._id, {
        code: args.code,
        submittedAt: ts,
        submissionRequestId: args.submissionRequestId,
        graderMode,
        graderVersion,
        rubricVersion,
        evalTimestamp: ts,
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
        submissionRequestId: args.submissionRequestId,
        graderMode,
        graderVersion,
        rubricVersion,
        evalTimestamp: ts,
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
      metadata: { graderMode, graderVersion, rubricVersion },
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
      graderMode,
      graderVersion,
      rubricVersion,
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
    let adminData: any = null;
    try {
      adminData = await ctx.runQuery(api.lms.getAdminDashboardData, {
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
        const totalSubmissionCount = adminData.totalSubmissionCount || submissions.length;
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
- Platform Name: ${config.instituteName || "Kriora LMS Portal"}
- Total Registered Students: ${students.length}
- Approved Enrolled Students: ${approvedStudents.length}
- Pending Student Registrations (Awaiting Administrator Approval): ${pendingStudents.length}
${
  pendingStudents.length > 0
    ? `  Detailed Pending List:\n${pendingStudents
        .map((s: any, idx: number) => `    ${idx + 1}. ${s.fullName} (${s.email}) — Course: ${s.preferredCourse || "Python Mastery"} | College: ${s.collegeName || "N/A"}`)
        .join("\n")}`
    : "  No pending registrations at this moment."
}
- Total LMS Batches (${batches.length}):
${
  batches.length > 0
    ? batches
        .map(
          (b: any, idx: number) =>
            `    ${idx + 1}. Batch "${b.name}" [ID: ${b.id}] — Status: ${b.status}, Enrolled: ${
              students.filter((s: any) => s.batchId === b.id).length
            }/${b.capacity || 50} students, Schedule: ${b.startTime || "N/A"} - ${b.endTime || "N/A"}`
        )
        .join("\n")
    : "    No batches configured yet."
}
- Published Announcements on Platform (${announcements.length}):
${
  announcements.length > 0
    ? announcements
        .slice(0, 8)
        .map((a: any, idx: number) => `    ${idx + 1}. "${a.title}" (Published: ${a.publishedAt || "Recently"})`)
        .join("\n")
    : "    No announcements published yet."
}
- Assessment Submissions Total: ${totalSubmissionCount} assessments submitted (Average Score: ${avgScore}/10)
- Configured Passing Thresholds: ${config.dailyPerfThreshold || 70}% (Daily Tasks), ${config.finalExamThreshold || 80}% (Final Exam)
`;
      }
    } catch (dbErr) {
      console.warn("[Admin Copilot] Could not query live admin data:", dbErr);
    }

    // ── Check if the admin requested to draft or preview an announcement ──
    const isPublishRequest =
      /\b(publish|post|broadcast|send|draft|create)\b.*\b(announcement|notice|update)\b/i.test(args.message) ||
      /\b(publish|post|broadcast)\s+(it|this|now)\b/i.test(args.message);

    if (isPublishRequest) {
      try {
        const parsePrompt = `You are drafting an announcement for the administrator to review before publishing to Kriora LMS.
Admin instruction: "${args.message}"
Recent conversation context:
${(args.history || []).slice(-3).map((m) => `${m.role}: ${m.content}`).join("\n")}

Respond ONLY with valid JSON in this exact structure:
{
  "title": "<Concise, attractive announcement title>",
  "content": "<Clear, motivating announcement text formatted in clean markdown>",
  "isPinned": false
}`;

        const parsedRaw = await generateConvexAI({
          messages: [{ role: "user", content: parsePrompt }],
          temperature: 0.3,
          jsonMode: true,
        });

        const jsonMatch = parsedRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const annData = JSON.parse(jsonMatch[0]);
          if (annData.title && annData.content) {
            const adminEmail = args.actorEmail || ADMIN_EMAILS[0];
            const author = getAdminAuthorName(adminEmail);

            const replyText = `📢 **Announcement Draft Created** (Ready for Review)

### **${annData.title}**
*Author: ${author}*

${annData.content}

---
💡 **Admin Confirmation Required:** To publish this to all enrolled students, navigate to the **Announcements** tab in your Admin Portal and click **New Announcement** or use the announcement editor with this content.`;

            return { success: true, text: replyText, reply: replyText, draft: annData };
          }
        }
      } catch (pubErr) {
        console.warn("[Admin Copilot] Draft generation failed:", pubErr);
      }
    }

    const system = `You are the Kriora LMS Admin Copilot with autonomous administrative execution powers and direct, real-time access to the live Convex Cloud database.

${livePlatformSummary || "Live database metrics unavailable."}

CRITICAL OPERATIONAL RULES:
1. When asked about metrics, pending registrations, batches, students, submissions, or platform statistics, ALWAYS display the EXACT REAL DATA provided above.
   - If pending student count is 0, state: "There are currently 0 pending student registrations awaiting approval."
   - If pending students exist, list their real names, emails, and courses.
   - List the actual LMS batches and their exact enrolled student counts.
   - NEVER fabricate, simulate, or hallucinate placeholder numbers (e.g. do not say 15, 485, 512, etc.) or past years (e.g. 2023). Quote the live database accurately.
2. If asked to draft or write an announcement, provide a polished draft in markdown and tell the admin:
   "💡 *To publish this immediately to all students on Kriora LMS, reply 'Publish this announcement'.*"
3. Keep all responses clean, structured, authoritative, and helpful. Always refer to the platform as Kriora LMS.`;

    const allMsgs = [...(args.history || []), { role: "user", content: args.message }];
    const text = await generateConvexAI({
      system,
      messages: allMsgs,
      temperature: 0.4,
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

// ─── PRACTICE ARENA QUERIES & MUTATIONS (V1) ────────────────────────────────

export const getPracticeProblems = query({
  args: { actorEmail: v.optional(v.string()) },
  handler: async (ctx, _args) => {
    const problems = await ctx.db
      .query("practiceProblems")
      .collect();

    // Sort by problemNumber ascending
    problems.sort((a, b) => a.problemNumber - b.problemNumber);

    // Lightweight projection for list view — full content fetched by getPracticeProblemDetail
    return problems.map((p) => ({
      id: p.id,
      problemNumber: p.problemNumber,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.topic,
      topics: p.topics,
      relatedDay: p.relatedDay,
      relatedCurriculumTopic: p.relatedCurriculumTopic,
      isPublished: p.isPublished,
      hasSolution: !!p.solution,
      publicTestCaseCount: p.publicTestCases?.length ?? 0,
      hiddenTestCaseCount: p.hiddenTestCases?.length ?? 0,
    }));
  },
});

export const getPracticeProblemById = query({
  args: { problemId: v.string(), actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const problem = await ctx.db
      .query("practiceProblems")
      .withIndex("by_custom_id", (q) => q.eq("id", args.problemId))
      .first();

    if (!problem) return null;

    // Full content returned only when a specific problem is opened
    return {
      id: problem.id,
      problemNumber: problem.problemNumber,
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      topic: problem.topic,
      topics: problem.topics,
      relatedDay: problem.relatedDay,
      relatedCurriculumTopic: problem.relatedCurriculumTopic,
      description: problem.description,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      constraints: problem.constraints,
      examples: problem.examples,
      starterCode: problem.starterCode,
      hints: problem.hints,
      publicTestCases: problem.publicTestCases,
      hiddenTestCases: problem.hiddenTestCases,
      isPublished: problem.isPublished,
      hasSolution: !!problem.solution,
    };
  },
});

export const getStudentPracticeContext = query({
  args: { actorEmail: v.optional(v.string()), serverSecret: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const student = await findStudentByIdentity(ctx, args.actorEmail, args.serverSecret);
    if (!student) {
      return {
        progressList: [],
        progressMap: {},
        bookmarkedIds: [],
        stats: {
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          totalAttempts: 0,
          successRate: 0,
          currentStreak: 0,
        },
        activityHistory: [],
      };
    }

    const [progressRecords, studentSubmissions] = await Promise.all([
      ctx.db
        .query("practiceProgress")
        .withIndex("by_student", (q) => q.eq("studentId", student.id))
        .collect(),
      ctx.db
        .query("practiceSubmissions")
        .withIndex("by_student", (q) => q.eq("studentId", student.id))
        .collect(),
    ]);

    // Fetch difficulty only for problems this student has progress on — not all 102
    const problemIds = [...new Set(progressRecords.map((pr) => pr.problemId))];
    const difficultyPromises = problemIds.map((pid) =>
      ctx.db.query("practiceProblems").withIndex("by_custom_id", (q) => q.eq("id", pid)).first()
    );
    const problemDocs = await Promise.all(difficultyPromises);
    const problemDifficultyMap = new Map(
      problemDocs.filter(Boolean).map((p) => [p!.id, p!.difficulty])
    );

    const totalSubmissionsCount = studentSubmissions.length;
    const acceptedSubmissionsCount = studentSubmissions.filter((s) => s.status === "Accepted").length;

    // Build lightweight progressMap without full submission objects
    const progressMap: Record<string, any> = {};
    const bookmarkedIds: string[] = [];
    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    let totalAttempts = 0;

    for (const pr of progressRecords) {
      progressMap[pr.problemId] = {
        status: pr.status,
        bookmarked: pr.bookmarked,
        solvedAt: pr.solvedAt,
        attemptsCount: pr.attemptsCount,
        lastAttemptedAt: pr.lastAttemptedAt,
      };
      if (pr.bookmarked) {
        bookmarkedIds.push(pr.problemId);
      }
      if (pr.status === "Solved") {
        totalSolved++;
        const diff = problemDifficultyMap.get(pr.problemId);
        if (diff === "Easy") easySolved++;
        else if (diff === "Medium") mediumSolved++;
        else if (diff === "Hard") hardSolved++;
      }
      totalAttempts += pr.attemptsCount || 0;
    }

    const successRate =
      totalSubmissionsCount > 0
        ? Math.round((acceptedSubmissionsCount / totalSubmissionsCount) * 1000) / 10
        : 0;

    // Compute activity from immutable submissions history (submittedAt timestamps)
    const dateCounts = new Map<string, number>();
    for (const sub of studentSubmissions) {
      if (sub.submittedAt) {
        const dateStr = sub.submittedAt.slice(0, 10);
        dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + 1);
      }
    }

    const activityHistory = Array.from(dateCounts.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // Calculate real practice streak
    const activeDates = Array.from(dateCounts.keys()).sort().reverse();
    let currentStreak = 0;
    if (activeDates.length > 0) {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      let checkDate = activeDates[0] === todayStr ? now : (activeDates[0] === yesterdayStr ? yesterday : null);

      if (checkDate) {
        let expectedDate = new Date(checkDate);
        for (const dateStr of activeDates) {
          const expStr = expectedDate.toISOString().slice(0, 10);
          if (dateStr === expStr) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else if (dateStr < expStr) {
            break;
          }
        }
      }
    }

    return {
      progressList: progressRecords,
      progressMap,
      bookmarkedIds,
      stats: {
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        totalAttempts,
        successRate,
        currentStreak,
      },
      activityHistory,
    };
  },
});

export const getPracticeSubmissions = query({
  args: { problemId: v.string(), actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const student = await findStudentByIdentity(ctx, args.actorEmail);
    if (!student) return [];

    const subs = await ctx.db
      .query("practiceSubmissions")
      .withIndex("by_student_problem", (q) =>
        q.eq("studentId", student.id).eq("problemId", args.problemId)
      )
      .collect();

    // Sort descending by submittedAt
    subs.sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));
    return subs;
  },
});

export const getOfficialSolution = query({
  args: { problemId: v.string(), actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const student = await findStudentByIdentity(ctx, args.actorEmail);
    const problem = await ctx.db
      .query("practiceProblems")
      .withIndex("by_custom_id", (q) => q.eq("id", args.problemId))
      .first();

    if (!problem || !problem.solution) return null;

    // Check if student has solved it or is admin
    let isSolved = false;
    if (student) {
      const prog = await ctx.db
        .query("practiceProgress")
        .withIndex("by_student_problem", (q) =>
          q.eq("studentId", student.id).eq("problemId", args.problemId)
        )
        .first();
      isSolved = prog?.status === "Solved";
    }

    const identity = await ctx.auth.getUserIdentity();
    const isAdmin = isAdminEmail(identity?.email || args.actorEmail);

    return {
      solution: problem.solution,
      isUnlocked: isSolved || isAdmin,
    };
  },
});

export const recordPracticeSubmission = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    problemId: v.string(),
    status: v.string(), // "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded"
    code: v.string(),
    passedTests: v.number(),
    totalTests: v.number(),
    runtimeMs: v.number(),
    submissionRequestId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const email = normalizeEmail(identity?.email || args.actorEmail);
    const ts = new Date().toISOString();

    let student: any = null;
    if (email) {
      student = await findStudentByIdentity(ctx, email);
    }

    if (!student) {
      const emailToUse = email || (identity?.subject ? `${identity.subject}@kriora.internal` : "student@kriora.internal");
      const newStudentId = "st_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      const studentDoc = {
        id: newStudentId,
        fullName: identity?.name || (isAdminEmail(emailToUse) ? "Santosh Reddy (Admin)" : emailToUse.split("@")[0]),
        email: emailToUse,
        phone: "",
        collegeName: "Kriora Academy",
        branch: "Computer Science",
        currentYear: "2026",
        graduationYear: "2026",
        status: "Approved",
        enrolledCourses: ["python-mastery"],
        registeredAt: ts,
        lastActive: ts,
        clerkUserId: identity?.subject,
      };
      const _id = await ctx.db.insert("students", studentDoc);
      student = { ...studentDoc, _id };
    }

    // Idempotency check on submissionRequestId
    if (args.submissionRequestId) {
      const existingReq = await ctx.db
        .query("practiceSubmissions")
        .withIndex("by_request_id", (q) =>
          q.eq("submissionRequestId", args.submissionRequestId!)
        )
        .first();

      if (existingReq && existingReq.studentId === student.id) {
        return {
          success: true,
          submissionId: existingReq.id,
          status: existingReq.status,
          idempotent: true,
        };
      }
    }

    // Get current progress record
    const existingProgress = await ctx.db
      .query("practiceProgress")
      .withIndex("by_student_problem", (q) =>
        q.eq("studentId", student.id).eq("problemId", args.problemId)
      )
      .first();

    const attemptNumber = (existingProgress?.attemptsCount || 0) + 1;
    const subId = "pr_sub_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    await ctx.db.insert("practiceSubmissions", {
      id: subId,
      studentId: student.id,
      problemId: args.problemId,
      status: args.status,
      code: args.code,
      passedTests: args.passedTests,
      totalTests: args.totalTests,
      runtimeMs: args.runtimeMs,
      submittedAt: ts,
      attemptNumber,
      submissionRequestId: args.submissionRequestId,
    });

    const isAccepted = args.status === "Accepted";
    const newStatus = isAccepted
      ? "Solved"
      : existingProgress?.status === "Solved"
      ? "Solved"
      : "Attempted";

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        status: newStatus,
        attemptsCount: attemptNumber,
        lastAttemptedAt: ts,
        ...(isAccepted && !existingProgress.solvedAt ? { solvedAt: ts } : {}),
        ...(isAccepted ? { bestSubmissionId: subId } : {}),
      });
    } else {
      await ctx.db.insert("practiceProgress", {
        id: "pr_prog_" + Date.now(),
        studentId: student.id,
        problemId: args.problemId,
        status: newStatus,
        bookmarked: false,
        bestSubmissionId: isAccepted ? subId : undefined,
        solvedAt: isAccepted ? ts : undefined,
        firstAttemptedAt: ts,
        lastAttemptedAt: ts,
        attemptsCount: 1,
      });
    }

    // Update student lastActive timestamp
    await ctx.db.patch(student._id, {
      lastActive: ts,
    });

    return {
      success: true,
      submissionId: subId,
      status: args.status,
      attemptNumber,
    };
  },
});

export const toggleBookmarkProblem = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    problemId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const email = normalizeEmail(identity?.email || args.actorEmail);
    const ts = new Date().toISOString();

    let student: any = null;
    if (email) {
      student = await findStudentByIdentity(ctx, email);
    }

    if (!student) {
      const emailToUse = email || (identity?.subject ? `${identity.subject}@kriora.internal` : "student@kriora.internal");
      const newStudentId = "st_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      const studentDoc = {
        id: newStudentId,
        fullName: identity?.name || (isAdminEmail(emailToUse) ? "Santosh Reddy (Admin)" : emailToUse.split("@")[0]),
        email: emailToUse,
        phone: "",
        collegeName: "Kriora Academy",
        branch: "Computer Science",
        currentYear: "2026",
        graduationYear: "2026",
        status: "Approved",
        enrolledCourses: ["python-mastery"],
        registeredAt: ts,
        lastActive: ts,
        clerkUserId: identity?.subject,
      };
      const _id = await ctx.db.insert("students", studentDoc);
      student = { ...studentDoc, _id };
    }

    const existing = await ctx.db
      .query("practiceProgress")
      .withIndex("by_student_problem", (q) =>
        q.eq("studentId", student.id).eq("problemId", args.problemId)
      )
      .first();

    if (existing) {
      const newBookmarked = !existing.bookmarked;
      await ctx.db.patch(existing._id, {
        bookmarked: newBookmarked,
        lastAttemptedAt: ts,
      });
      return { success: true, bookmarked: newBookmarked };
    } else {
      await ctx.db.insert("practiceProgress", {
        id: "pr_prog_" + Date.now(),
        studentId: student.id,
        problemId: args.problemId,
        status: "Not Attempted",
        bookmarked: true,
        firstAttemptedAt: ts,
        lastAttemptedAt: ts,
        attemptsCount: 0,
      });
      return { success: true, bookmarked: true };
    }
  },
});

export const seedPracticeProblems = mutation({
  args: {
    actorEmail: v.optional(v.string()),
    serverSecret: v.optional(v.string()),
    problems: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail, args.serverSecret);

    let inserted = 0;
    let updated = 0;
    const ts = new Date().toISOString();

    for (const p of args.problems) {
      if (!p.id || !p.title || !p.problemNumber) continue;

      const existing = await ctx.db
        .query("practiceProblems")
        .withIndex("by_custom_id", (q) => q.eq("id", p.id))
        .first();

      const doc = {
        id: p.id,
        problemNumber: p.problemNumber,
        slug: p.slug || p.id,
        title: p.title,
        difficulty: p.difficulty || "Easy",
        topic: p.topic || "Basics",
        topics: p.topics || [p.topic || "Basics"],
        relatedDay: p.relatedDay,
        relatedCurriculumTopic: p.relatedCurriculumTopic,
        description: p.description || "",
        inputFormat: p.inputFormat || "",
        outputFormat: p.outputFormat || "",
        constraints: p.constraints || "",
        examples: p.examples || [],
        starterCode: p.starterCode || "",
        hints: p.hints || [],
        publicTestCases: p.publicTestCases || [],
        hiddenTestCases: p.hiddenTestCases || [],
        solution: p.solution || undefined,
        isPublished: p.isPublished !== false,
        updatedAt: ts,
      };

      if (existing) {
        await ctx.db.patch(existing._id, doc);
        updated++;
      } else {
        await ctx.db.insert("practiceProblems", {
          ...doc,
          createdAt: ts,
        });
        inserted++;
      }
    }

    await ctx.db.insert("auditLogs", {
      id: "log-" + Date.now(),
      timestamp: ts,
      userId: "admin-core",
      userName: "Director Admin",
      userEmail: getAuditEmail(args.actorEmail),
      role: "Admin",
      action: "Practice Problems Seeded",
      details: `Seeded Practice Problems catalog: ${inserted} inserted, ${updated} updated`,
    });

    return { success: true, inserted, updated, total: args.problems.length };
  },
});

export const getAdminPracticeOverview = query({
  args: { actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);

    const [submissions, progressRecords, students] = await Promise.all([
      ctx.db.query("practiceSubmissions").order("desc").take(250),
      ctx.db.query("practiceProgress").collect(),
      ctx.db.query("students").collect(),
    ]);

    const solvedCount = progressRecords.filter((p) => p.status === "Solved").length;

    const studentMap = new Map<string, { fullName: string; email: string; batchId?: string }>();
    students.forEach((s) => {
      studentMap.set(s.id, { fullName: s.fullName, email: s.email, batchId: s.batchId });
      studentMap.set(s.email, { fullName: s.fullName, email: s.email, batchId: s.batchId });
    });

    const enrichedSubmissions = submissions.map((sub) => {
      const student = studentMap.get(sub.studentId);
      return {
        id: sub.id,
        studentId: sub.studentId,
        problemId: sub.problemId,
        status: sub.status,
        passedTests: sub.passedTests,
        totalTests: sub.totalTests,
        runtimeMs: sub.runtimeMs,
        submittedAt: sub.submittedAt,
        attemptNumber: sub.attemptNumber,
        studentName: student?.fullName || sub.studentId,
        studentEmail: student?.email || "",
        studentBatchId: student?.batchId || "Unassigned",
      };
    });

    return {
      submissions: enrichedSubmissions,
      progressCount: progressRecords.length,
      solvedCount,
    };
  },
});

export const getAdminSubmissionCode = query({
  args: { submissionId: v.string(), actorEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.actorEmail);
    const sub = await ctx.db
      .query("practiceSubmissions")
      .withIndex("by_custom_id", (q) => q.eq("id", args.submissionId))
      .first();
    return sub ? sub.code : null;
  },
});




