export const GET_STUDENTS = `
  query GetStudents {
    students {
      id
      name
      email
      course
      className
      major
      averageScore
      examsTaken
      trend
      lastActive
      examHistory {
        id
        student_id
        name
        date
        score
        maxScore
        grade
      }
    }
  }
`;

export const GET_STUDENTS_LEGACY = `
  query GetStudentsLegacy {
    students {
      id
      name
      email
      course
      major
      averageScore
      examsTaken
      trend
      lastActive
      examHistory {
        id
        student_id
        name
        date
        score
        maxScore
        grade
      }
    }
  }
`;

export const GET_STUDENTS_MINIMAL = `
  query GetStudentsMinimal {
    students {
      id
      name
      email
      created_at
    }
  }
`;
