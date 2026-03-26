import {
  FaceDetector,
  FilesetResolver,
  ObjectDetector,
} from "@mediapipe/tasks-vision";

export type HeadPose = "forward" | "left" | "right" | "down" | "up" | "no-face";

export type ProctorFrameState = {
  peopleCount: number;
  headPose: HeadPose;
  yaw: number;
  pitch: number;
  phoneVisible: boolean;
  phoneScore: number;
  suspicious: boolean;
};

type ProctorDetectorOptions = {
  faceModelPath?: string;
  objectModelPath?: string;
  wasmPath?: string;
  phoneScoreThreshold?: number;
};

type DetectorInstance = {
  processFrame: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => ProctorFrameState;
  dispose: () => void;
};

const DEFAULT_WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const DEFAULT_FACE_MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

const DEFAULT_OBJECT_MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite";

const PHONE_LABELS = new Set([
  "cell phone",
  "mobile phone",
  "phone",
  "smartphone",
]);

function emptyState(): ProctorFrameState {
  return {
    peopleCount: 0,
    headPose: "no-face",
    yaw: 0,
    pitch: 0,
    phoneVisible: false,
    phoneScore: 0,
    suspicious: true,
  };
}

function getKeypoints(detection: any) {
  return detection?.keypoints ?? detection?.normalizedKeypoints ?? [];
}

function classifyHeadPoseFromDetection(detection: any): {
  pose: HeadPose;
  yaw: number;
  pitch: number;
} {
  const keypoints = getKeypoints(detection);

  if (keypoints.length < 6) {
    return { pose: "no-face", yaw: 0, pitch: 0 };
  }

  const [leftEye, rightEye, nose, mouth, leftTragion, rightTragion] = keypoints;

  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const eyeMidY = (leftEye.y + rightEye.y) / 2;

  const faceWidth =
    Math.abs((rightTragion?.x ?? rightEye.x) - (leftTragion?.x ?? leftEye.x)) ||
    Math.abs(rightEye.x - leftEye.x) ||
    0.000001;

  const eyeToMouth = Math.abs((mouth?.y ?? eyeMidY) - eyeMidY) || 0.000001;

  const yaw = (nose.x - eyeMidX) / faceWidth;
  const pitch = (nose.y - eyeMidY) / eyeToMouth;

  let pose: HeadPose = "forward";

  if (pitch > 0.62) pose = "down";
  else if (pitch < 0.32) pose = "up";
  else if (yaw > 0.08) pose = "right";
  else if (yaw < -0.08) pose = "left";

  return { pose, yaw, pitch };
}

function extractBestPhoneDetection(
  detections: any[],
  minScore: number,
): { score: number; label: string } | null {
  let best: { score: number; label: string } | null = null;

  for (const detection of detections ?? []) {
    const categories = detection?.categories ?? [];

    for (const category of categories) {
      const label = String(category?.categoryName ?? "").toLowerCase();
      const score = Number(category?.score ?? 0);

      if (!PHONE_LABELS.has(label)) continue;
      if (score < minScore) continue;

      if (!best || score > best.score) {
        best = { score, label };
      }
    }
  }

  return best;
}

export async function createProctorDetector(
  options: ProctorDetectorOptions = {},
): Promise<DetectorInstance> {
  const wasmPath = options.wasmPath ?? DEFAULT_WASM_PATH;
  const faceModelPath = options.faceModelPath ?? DEFAULT_FACE_MODEL_PATH;
  const objectModelPath = options.objectModelPath ?? DEFAULT_OBJECT_MODEL_PATH;
  const phoneScoreThreshold = options.phoneScoreThreshold ?? 0.35;

  const vision = await FilesetResolver.forVisionTasks(wasmPath);

  const faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: faceModelPath,
    },
    runningMode: "VIDEO",
    minDetectionConfidence: 0.55,
    minSuppressionThreshold: 0.3,
  });

  const objectDetector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: objectModelPath,
    },
    runningMode: "VIDEO",
    maxResults: 5,
    scoreThreshold: phoneScoreThreshold,
  });

  let disposed = false;
  let lastFaceRun = 0;
  let lastObjectRun = 0;
  let lastSafeTimestamp = 0;
  let cachedFaceResult: any = null;
  let cachedObjectResult: any = null;

  function processFrame(
    video: HTMLVideoElement,
    timestamp: number,
  ): ProctorFrameState {
    if (disposed) return emptyState();
    if (!video) return emptyState();

    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return emptyState();
    }

    const incomingTimestamp =
      Number.isFinite(timestamp) && timestamp > 0
        ? timestamp
        : performance.now();

    const safeTimestamp =
      incomingTimestamp > lastSafeTimestamp
        ? incomingTimestamp
        : lastSafeTimestamp + 1;

    lastSafeTimestamp = safeTimestamp;

    if (safeTimestamp - lastFaceRun > 66) {
      try {
        cachedFaceResult = faceDetector.detectForVideo(video, safeTimestamp);
        lastFaceRun = safeTimestamp;
      } catch (error) {
        console.error("faceDetector.detectForVideo failed", {
          error,
          timestamp: safeTimestamp,
          readyState: video.readyState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          currentTime: video.currentTime,
        });
      }
    }

    if (safeTimestamp - lastObjectRun > 180) {
      try {
        cachedObjectResult = objectDetector.detectForVideo(
          video,
          safeTimestamp,
        );
        lastObjectRun = safeTimestamp;
      } catch (error) {
        console.error("objectDetector.detectForVideo failed", {
          error,
          timestamp: safeTimestamp,
          readyState: video.readyState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          currentTime: video.currentTime,
        });
      }
    }

    const faceDetections = cachedFaceResult?.detections ?? [];
    const peopleCount = faceDetections.length;

    const primaryFace = faceDetections[0];
    const head = primaryFace
      ? classifyHeadPoseFromDetection(primaryFace)
      : { pose: "no-face" as HeadPose, yaw: 0, pitch: 0 };

    const phoneDetection = extractBestPhoneDetection(
      cachedObjectResult?.detections ?? [],
      phoneScoreThreshold,
    );

    const phoneVisible = Boolean(phoneDetection);
    const suspicious =
      peopleCount !== 1 || head.pose === "down" || phoneVisible;

    return {
      peopleCount,
      headPose: head.pose,
      yaw: head.yaw,
      pitch: head.pitch,
      phoneVisible,
      phoneScore: phoneDetection?.score ?? 0,
      suspicious,
    };
  }

  function dispose() {
    disposed = true;
    faceDetector.close?.();
    objectDetector.close?.();
    cachedFaceResult = null;
    cachedObjectResult = null;
  }

  return {
    processFrame,
    dispose,
  };
}
