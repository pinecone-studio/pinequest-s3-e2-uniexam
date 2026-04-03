export const GET_STUDENTS_REAL = `
  query StudentsPageRealData {
    students {
      id
      name
      email
      major
      created_at
    }
    enrollments {
      id
      student_id
      course_id
    }
    courses {
      id
      code
    }
    exams {
      id
      title
      course_id
    }
    submissions {
      id
      student_id
      exam_id
      status
      final_score
      submitted_at
      started_at
    }
    cheatLogs {
      id
      student_id
      severity
    }
  }
`;

export const GET_STUDENTS_REAL_LEGACY = `
  query StudentsPageRealDataLegacy {
    students {
      id
      name
      email
      created_at
    }
    enrollments {
      id
      student_id
      course_id
    }
    courses {
      id
      code
    }
    exams {
      id
      title
      course_id
    }
    submissions {
      id
      student_id
      exam_id
      status
      final_score
      submitted_at
      started_at
    }
    cheatLogs {
      id
      student_id
      severity
    }
  }
`;
