import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 100 },
    { duration: "20s", target: 1000 },
    { duration: "10s", target: 0 },
  ],
};

export default function () {
  const res = http.post(
    "http://localhost:3000/api/graphql",
    JSON.stringify({
      query: `mutation { generateExam(courseId: "831dd3d9-8479-45ac-b664-b32b51c83bec", topic: "algebra") }`
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, {
    "status 200": (r) => r.status === 200,
  });

  sleep(1);
}
