export type UpcomingExam = {
  id: string;
  courseCode: string;
  title: string;
  date: string;
  topics: string[];
};

export type PracticeQuestion = {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type CourseGrade = {
  courseId: string;
  courseCode: string;
  courseName: string;
  currentGrade: number;
  exams: {
    name: string;
    score: number | null;
    maxScore: number;
    weight: number;
  }[];
};

export const upcomingExams: UpcomingExam[] = [
  {
    id: "cs-201-midterm",
    courseCode: "CS 201",
    title: "Өгөгдлийн бүтэц - Дунд шалгалт",
    date: "2026-04-02",
    topics: ["Массив", "Мод", "Хэш хүснэгт", "Big-O"],
  },
  {
    id: "math-210-quiz",
    courseCode: "MATH 210",
    title: "Шугаман алгебр - Богино шалгалт",
    date: "2026-04-08",
    topics: ["Матриц", "Өөрийн утга", "Вектор орон"],
  },
  {
    id: "se-301-final",
    courseCode: "SE 301",
    title: "Програм хангамжийн инженерчлэл - Улирлын шалгалт",
    date: "2026-04-19",
    topics: ["Тестлэлт", "Дизайн хэв маяг", "Agile"],
  },
];

export const practiceQuestions: PracticeQuestion[] = [
  {
    topic: "Big-O",
    difficulty: "easy",
    question: "Оролтын хэмжээ өсөхөд аль хугацааны төвөг хамгийн хурдан бэ?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"],
    correctAnswer: 2,
    explanation: "Эндхээс O(log n) хамгийн удаан өсдөг.",
  },
  {
    topic: "Хэш хүснэгт",
    difficulty: "medium",
    question: "Хэш хүснэгтийн дундаж хайлтын хугацаа хэд вэ?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 0,
    explanation: "Сайн хэш функцтэй үед дундаж хайлт тогтмол хугацаатай.",
  },
  {
    topic: "Матриц",
    difficulty: "easy",
    question: "Матрицын детерминант юуг илэрхийлдэг вэ?",
    options: [
      "Матриц урвуу эсэх",
      "Матрицын мөрүүдийн нийлбэр",
      "Мөрийн тоо",
      "Өөрийн векторууд",
    ],
    correctAnswer: 0,
    explanation: "Тэгээс ялгаатай детерминанттай бол матриц урвуутай.",
  },
  {
    topic: "Дизайн хэв маяг",
    difficulty: "medium",
    question: "Дэд системд хялбар интерфэйс өгдөг хэв маяг аль вэ?",
    options: ["Adapter", "Facade", "Observer", "Strategy"],
    correctAnswer: 1,
    explanation: "Facade нь дэд системүүдийн дээр энгийн интерфэйс өгдөг.",
  },
  {
    topic: "Тестлэлт",
    difficulty: "hard",
    question: "Системийг бүхэлд нь шалгадаг тестийн төрөл аль вэ?",
    options: ["Unit test", "Integration test", "End-to-end test", "Snapshot test"],
    correctAnswer: 2,
    explanation: "End-to-end тест нь бүх урсгалыг бүрэн шалгана.",
  },
];

export const grades: CourseGrade[] = [
  {
    courseId: "cs-201",
    courseCode: "CS 201",
    courseName: "Өгөгдлийн бүтэц",
    currentGrade: 88,
    exams: [
      { name: "Богино шалгалт 1", score: 18, maxScore: 20, weight: 10 },
      { name: "Дунд шалгалт", score: 84, maxScore: 100, weight: 30 },
      { name: "Төсөл", score: 92, maxScore: 100, weight: 40 },
      { name: "Улирлын шалгалт", score: null, maxScore: 100, weight: 20 },
    ],
  },
  {
    courseId: "math-210",
    courseCode: "MATH 210",
    courseName: "Шугаман алгебр",
    currentGrade: 81,
    exams: [
      { name: "Богино шалгалт 1", score: 16, maxScore: 20, weight: 10 },
      { name: "Богино шалгалт 2", score: 14, maxScore: 20, weight: 10 },
      { name: "Дунд шалгалт", score: 76, maxScore: 100, weight: 30 },
      { name: "Улирлын шалгалт", score: null, maxScore: 100, weight: 50 },
    ],
  },
  {
    courseId: "se-301",
    courseCode: "SE 301",
    courseName: "Програм хангамжийн инженерчлэл",
    currentGrade: 93,
    exams: [
      { name: "Sprint Review", score: 48, maxScore: 50, weight: 20 },
      { name: "Дизайн баримт", score: 45, maxScore: 50, weight: 20 },
      { name: "Дунд шалгалт", score: 90, maxScore: 100, weight: 30 },
      { name: "Улирлын шалгалт", score: null, maxScore: 100, weight: 30 },
    ],
  },
];

export const courses = [
  { id: "cs-201", name: "Өгөгдлийн бүтэц" },
  { id: "math-210", name: "Шугаман алгебр" },
  { id: "se-301", name: "Програм хангамжийн инженерчлэл" },
];
