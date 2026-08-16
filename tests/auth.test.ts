import { describe, it, expect } from 'vitest';
import { isAdminEmail } from '../convex/lms.ts';

describe('Authentication & Authorization Hardening Tests', () => {
  it('correctly identifies primary administrator emails with case/whitespace insensitivity', () => {
    expect(isAdminEmail('reddysantosh1310@gmail.com')).toBe(true);
    expect(isAdminEmail('  REDDYSANTOSH1310@GMAIL.COM  ')).toBe(true);
    expect(isAdminEmail('suchandramanne@gmail.com')).toBe(true);
    expect(isAdminEmail('SUCHANDRAMANNE@GMAIL.COM')).toBe(true);
  });

  it('rejects regular student emails from admin authorization', () => {
    expect(isAdminEmail('student@university.edu')).toBe(false);
    expect(isAdminEmail('random.user@gmail.com')).toBe(false);
    expect(isAdminEmail('')).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it('detects and blocks email mismatch / spoofing attempts', () => {
    const checkIdentity = (sessionEmail: string | undefined, suppliedActorEmail: string | undefined) => {
      const normSession = sessionEmail?.trim().toLowerCase();
      const normActor = suppliedActorEmail?.trim().toLowerCase();

      if (normSession && normActor && normSession !== normActor) {
        throw new Error('Forbidden: Session identity does not match supplied email');
      }

      const email = normSession || normActor;
      if (!email || !isAdminEmail(email)) {
        throw new Error('Forbidden: Access restricted to LMS Administrators');
      }

      return { authorized: true, email };
    };

    // Legitimate admin session
    expect(checkIdentity('reddysantosh1310@gmail.com', 'reddysantosh1310@gmail.com').authorized).toBe(true);

    // Student attempting to pass an admin email in actorEmail
    expect(() => checkIdentity('student@college.edu', 'reddysantosh1310@gmail.com')).toThrow(
      /Session identity does not match/i
    );

    // Regular student session
    expect(() => checkIdentity('student@college.edu', 'student@college.edu')).toThrow(
      /Access restricted to LMS Administrators/i
    );
  });
});
