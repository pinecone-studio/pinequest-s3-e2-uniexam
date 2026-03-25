export type QuestionType = "Short Answer" | "Multiple Choice" | "True/False";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type Choice = {
  id: string;
  label: string;
};

export type ExamQuestionType = {
  id: number;
  question: string;
  type: QuestionType;
  difficulty: Difficulty;
  choices?: Choice[]; // only for Multiple Choice
  correctAnswer: string; // for grading (not shown during exam)
};

export const examName = {
  title: "Компьютерийн Шинжлэх Ухаан",
  subtitle: "Үндсэн Ойлголтууд",
  durationSeconds: 3600, // 60 минут
};

export const mockExam: ExamQuestionType[] = [
  {
    id: 1,
    question: "2 + 2 * 3 үйлдлийн үр дүн юу вэ?",
    type: "Short Answer",
    difficulty: "Easy",
    correctAnswer: "8",
  },
  {
    id: 2,
    question:
      "LIFO (сүүлд орсон, түрүүлж гарна) зарчмаар ажилладаг өгөгдлийн бүтэц аль нь вэ?",
    type: "Multiple Choice",
    difficulty: "Easy",
    choices: [
      { id: "a", label: "Дараалал (Queue)" },
      { id: "b", label: "Стек (Stack)" },
      { id: "c", label: "Холбоост жагсаалт (Linked List)" },
      { id: "d", label: "Мод (Tree)" },
    ],
    correctAnswer: "b",
  },
  {
    id: 3,
    question: "CPU гэдэг үгийн тайлбарыг бичнэ үү.",
    type: "Short Answer",
    difficulty: "Easy",
    correctAnswer: "Төв боловсруулах нэгж (Central Processing Unit)",
  },
  {
    id: 4,
    question: "2-тын тоолол дахь 1010 тоо 10-тын тооллоор хэд болох вэ?",
    type: "Multiple Choice",
    difficulty: "Medium",
    choices: [
      { id: "a", label: "8" },
      { id: "b", label: "10" },
      { id: "c", label: "12" },
      { id: "d", label: "14" },
    ],
    correctAnswer: "b",
  },
  {
    id: 5,
    question: "Холбоост жагсаалт нь индексээр O(1) хугацаанд хандах боломжтой.",
    type: "True/False",
    difficulty: "Easy",
    choices: [
      { id: "true", label: "Үнэн" },
      { id: "false", label: "Худал" },
    ],
    correctAnswer: "false",
  },
  {
    id: 6,
    question:
      "Эрэмбэлэгдсэн массив дээр хоёртын хайлтын цаг хугацааны нарийн төвөгтэй байдал ямар вэ?",
    type: "Multiple Choice",
    difficulty: "Medium",
    choices: [
      { id: "a", label: "O(n)" },
      { id: "b", label: "O(n²)" },
      { id: "c", label: "O(log n)" },
      { id: "d", label: "O(1)" },
    ],
    correctAnswer: "c",
  },
  {
    id: 7,
    question:
      "Рекурс гэж юу болохыг тайлбарлаж, бодит амьдралын жишээ өгнө үү.",
    type: "Short Answer",
    difficulty: "Medium",
    correctAnswer:
      "Рекурс гэдэг нь функц өөрийгөө дуудаж асуудлын жижиг хэсгийг шийддэг арга юм.",
  },
  {
    id: 8,
    question:
      "Дараах хэлнүүдийн аль нь объект хандалтат програмчлалын хэл биш вэ?",
    type: "Multiple Choice",
    difficulty: "Easy",
    choices: [
      { id: "a", label: "Java" },
      { id: "b", label: "Python" },
      { id: "c", label: "C" },
      { id: "d", label: "C++" },
    ],
    correctAnswer: "c",
  },
  {
    id: 9,
    question: "HTTP нь төлөвгүй (stateless) протокол юм.",
    type: "True/False",
    difficulty: "Easy",
    choices: [
      { id: "true", label: "Үнэн" },
      { id: "false", label: "Худал" },
    ],
    correctAnswer: "true",
  },
  {
    id: 10,
    question:
      "QuickSort алгоритмын хамгийн муу тохиолдлын цаг хугацааны нарийн төвөгтэй байдал ямар вэ?",
    type: "Multiple Choice",
    difficulty: "Hard",
    choices: [
      { id: "a", label: "O(n log n)" },
      { id: "b", label: "O(n²)" },
      { id: "c", label: "O(n)" },
      { id: "d", label: "O(log n)" },
    ],
    correctAnswer: "b",
  },
  {
    id: 11,
    question: "Процесс болон урсгал (thread) хоёрын ялгааг тайлбарлана уу.",
    type: "Short Answer",
    difficulty: "Medium",
    correctAnswer:
      "Процесс нь өөрийн санах ойтой бие даасан програм; урсгал нь процессын дотор нийтлэг санах ойг хуваалцдаг хөнгөн нэгж юм.",
  },
  {
    id: 12,
    question: "OSI загварын аль давхарга IP хаягжуулалтыг хариуцдаг вэ?",
    type: "Multiple Choice",
    difficulty: "Medium",
    choices: [
      { id: "a", label: "Өгөгдлийн холбоос (Data Link)" },
      { id: "b", label: "Тээвэр (Transport)" },
      { id: "c", label: "Сүлжээ (Network)" },
      { id: "d", label: "Сессий (Session)" },
    ],
    correctAnswer: "c",
  },
  {
    id: 13,
    question: "n зангилаатай хоёртын мод яг n-1 ирмэгтэй байдаг.",
    type: "True/False",
    difficulty: "Medium",
    choices: [
      { id: "true", label: "Үнэн" },
      { id: "false", label: "Худал" },
    ],
    correctAnswer: "true",
  },
  {
    id: 14,
    question: "SQL гэдэг үгийн тайлбарыг бичнэ үү.",
    type: "Short Answer",
    difficulty: "Easy",
    correctAnswer: "Бүтэцлэгдсэн асуулгын хэл (Structured Query Language)",
  },
  {
    id: 15,
    question:
      "Дараах эрэмбэлэх алгоритмуудын аль нь тогтвортой (stable) гэж тооцогддог вэ?",
    type: "Multiple Choice",
    difficulty: "Medium",
    choices: [
      { id: "a", label: "QuickSort" },
      { id: "b", label: "HeapSort" },
      { id: "c", label: "MergeSort" },
      { id: "d", label: "Сонголтын эрэмбэлэлт (Selection Sort)" },
    ],
    correctAnswer: "c",
  },
  {
    id: 16,
    question:
      "Объект хандалтат програмчлалын полиморфизм ойлголтыг жишээ сайт тайлбарлана уу.",
    type: "Short Answer",
    difficulty: "Hard",
    correctAnswer:
      "Полиморфизм нь өөр өөр классын объектуудыг нийтлэг интерфейсээр ижил төрлөөр авч үзэх боломж олгодог.",
  },
  {
    id: 17,
    question: "Дараах мэдээллийн сангуудын аль нь NoSQL мэдээллийн сан вэ?",
    type: "Multiple Choice",
    difficulty: "Easy",
    choices: [
      { id: "a", label: "PostgreSQL" },
      { id: "b", label: "MySQL" },
      { id: "c", label: "MongoDB" },
      { id: "d", label: "SQLite" },
    ],
    correctAnswer: "c",
  },
  {
    id: 18,
    question:
      "Зэрэгцээ програмчлалд deadlock гэж юу болохыг тайлбарлаж, хэрхэн запобигать хийх талаар бичнэ үү.",
    type: "Short Answer",
    difficulty: "Hard",
    correctAnswer:
      "Deadlock нь хоёр буюу түүнээс дээш урсгал бие биенийхээ нөөцийг хүлээж хязгааргүй блоклогдох нөхцөл байдал юм.",
  },
];
