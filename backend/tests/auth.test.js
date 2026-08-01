// tests/auth.test.js — Tests for teacher and student auth middleware
// Validates that JWT verification works correctly and rejects invalid tokens.

import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

// ─── Mock the logger so tests don't emit logs ─────────────────────────────────

jest.mock("../utils/logger.js", () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const JWT_TEACHER_PASSWORD = "teacher_password_jwt";
const JWT_STUDENT_PASSWORD = "student_password_jwt";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeReq(token) {
  return {
    headers: { authorization: token ? `Bearer ${token}` : undefined },
  };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ─── Teacher Middleware Tests ─────────────────────────────────────────────────

describe("teacherMiddleware", () => {
  let teacherMiddleware;

  beforeAll(async () => {
    const mod = await import("../middlewares/teacher.js");
    teacherMiddleware = mod.default;
  });

  test("calls next() with valid teacher token", () => {
    const token = jwt.sign({ teacherId: "abc123" }, JWT_TEACHER_PASSWORD);
    const req = makeReq(token);
    const res = makeRes();
    const next = jest.fn();

    teacherMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.teacherId).toBe("abc123");
  });

  test("returns 401 when token is missing", () => {
    const req = makeReq(null);
    const res = makeRes();
    const next = jest.fn();

    teacherMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when token is invalid/tampered", () => {
    const req = makeReq("this.is.not.a.valid.jwt");
    const res = makeRes();
    const next = jest.fn();

    teacherMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when student token is used for teacher route", () => {
    // Token signed with student secret should be rejected by teacher middleware
    const wrongToken = jwt.sign({ studentId: "xyz789" }, JWT_STUDENT_PASSWORD);
    const req = makeReq(wrongToken);
    const res = makeRes();
    const next = jest.fn();

    teacherMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── Student Middleware Tests ─────────────────────────────────────────────────

describe("studentMiddleware", () => {
  let studentMiddleware;

  beforeAll(async () => {
    const mod = await import("../middlewares/student.js");
    studentMiddleware = mod.default;
  });

  test("calls next() with valid student token", () => {
    const token = jwt.sign({ studentId: "stu123" }, JWT_STUDENT_PASSWORD);
    const req = makeReq(token);
    const res = makeRes();
    const next = jest.fn();

    studentMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.studentId).toBe("stu123");
  });

  test("returns 401 when token is missing", () => {
    const req = makeReq(null);
    const res = makeRes();
    const next = jest.fn();

    studentMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when token is expired", () => {
    const expiredToken = jwt.sign({ studentId: "stu123" }, JWT_STUDENT_PASSWORD, { expiresIn: "0s" });
    const req = makeReq(expiredToken);
    const res = makeRes();
    const next = jest.fn();

    studentMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
