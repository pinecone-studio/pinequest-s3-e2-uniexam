import { teacherTypeDefs } from "./modules/teachers/schema";
import { teacherQueries } from "./modules/teachers/queries";
import { teacherMutations } from "./modules/teachers/mutations";

import { studentTypeDefs } from "./modules/students/schema";
import { studentQueries } from "./modules/students/queries";
import { studentMutations } from "./modules/students/mutations";

import { submissionTypeDefs } from "./modules/submissions/schema";
import { submissionQueries } from "./modules/submissions/queries";
import { submissionMutations } from "./modules/submissions/mutations";

import { examTypeDefs } from "./modules/exams/schema";
import { examQueries } from "./modules/exams/queries";
import { examMutations } from "./modules/exams/mutations";

import { questionTypeDefs } from "./modules/questions/schema";
import { questionQueries } from "./modules/questions/queries";
import { questionMutations } from "./modules/questions/mutations";

import { courseTypeDefs } from "./modules/courses/schema";
import { courseQueries } from "./modules/courses/queries";
import { courseMutations } from "./modules/courses/mutations";

import { answerTypeDefs } from "./modules/answers/schema";
import { answerQueries } from "./modules/answers/queries";
import { answerMutations } from "./modules/answers/mutations";

import { submissionAnswerTypeDefs } from "./modules/submission-answers/schema";
import { submissionAnswerQueries } from "./modules/submission-answers/queries";
import { submissionAnswerMutations } from "./modules/submission-answers/mutations";

import { enrollmentTypeDefs } from "./modules/enrollments/schema";
import { enrollmentQueries } from "./modules/enrollments/queries";
import { enrollmentMutations } from "./modules/enrollments/mutations";
import { relationResolvers } from "./relations";

export const typeDefs = `#graphql
  type Query { _: Boolean }
  type Mutation { _: Boolean }

  ${teacherTypeDefs}
  ${studentTypeDefs}
  ${submissionTypeDefs}
  ${examTypeDefs}
  ${questionTypeDefs}
  ${courseTypeDefs}
  ${answerTypeDefs}
  ${submissionAnswerTypeDefs}
  ${enrollmentTypeDefs}
`;

export const resolvers = {
  Query: {
    ...teacherQueries,
    ...studentQueries,
    ...submissionQueries,
    ...examQueries,
    ...questionQueries,
    ...courseQueries,
    ...answerQueries,
    ...submissionAnswerQueries,
    ...enrollmentQueries,
  },
  Mutation: {
    ...teacherMutations,
    ...studentMutations,
    ...submissionMutations,
    ...examMutations,
    ...questionMutations,
    ...courseMutations,
    ...answerMutations,
    ...submissionAnswerMutations,
    ...enrollmentMutations,
  },
  Course: relationResolvers.Course,
  Exam: relationResolvers.Exam,
  Question: relationResolvers.Question,
  Submission: relationResolvers.Submission,
};
