"use client"; // là một chỉ thị (directive) khai báo Component này là một Client Component (default: Server Component)
// -> để dùng React Hooks, tương tác với trình phát Audio, Lắng nghe sự kiện từ phía người dùng

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useDictation from "@/hooks/useDictation";
import type { DictationSubmitResult } from "@/hooks/useDictation";
import LoadAnimation from "@/components/ui/load-animation";
import ErrorMessage from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DictationPage() {
  const { id: lessonId } = useParams<{ id: string }>();
  // useParams: đọc các giá trị động (dynamic parameters) từ URL của trình duyệt
  // [id] -> { id: '6677028' }

  const router = useRouter();
  // useRouter: điều hướng bằng code JavaScript thay vì
  // bắt người dùng phải click vào một thẻ Link <a> truyền thống

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { segments, progressMap, startIndex, loading, error, submitSegment } =
    useDictation(lessonId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<DictationSubmitResult | null>(null); // { score, completed }
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Sync currentIndex khi startIndex load xong
  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  const segment = segments[currentIndex];
  const isLast = currentIndex === segments.length - 1;

  const playSegment = () => {
    const audio = audioRef.current;
    if (!audio || !segment) return; // tránh audio, segment undefined
    // -> khi chưa load xong nhưng người dùng thao tác -> null. -> crash

    audio.currentTime = segment.startMs / 1000; // ms -> s do audio.currentTime nhận s
    audio.play();

    const onTimeUpdate = () => {
      if (audio.currentTime >= segment.endMs / 1000) {
        audio.pause();
        audio.removeEventListener("timeupdate", onTimeUpdate); // tránh leak memory
        //timeupdate là một sự kiện (event) mặc định của thẻ <audio> trên trình duyệt.
      }
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
  };

  const handleSubmit = async () => {
    if (!userInput.trim() || submitting) return;
    setSubmitError("");
    setSubmitting(true);

    try {
      const { score, completed } = await submitSegment(segment._id, userInput);
      setResult({ score, completed });
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || "Submit failed, please try again",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setUserInput("");
    setResult(null);
    setSubmitError("");
    setCurrentIndex((i) => i + 1);
  };

  if (loading) {
    return <LoadAnimation />;
  }
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Hoàn thành toàn bộ lesson
  if (!segment) {
    return (
      <div className="container mt-5 text-center">
        <div className="card shadow border-0 rounded-4 p-5">
          <h2 className="fw-bold text-success mb-3">🎉 Hoàn thành!</h2>
          <p className="text-muted">
            Bạn đã hoàn thành tất cả câu trong bài học này.
          </p>
          <Button
            variant="default"
            size="lg"
            className="mt-3"
            onClick={() => router.push(`/lessons/${lessonId}`)}
          >
            Quay lại bài học
          </Button>
        </div>
      </div>
    );
  }

  // Main
  return (
    <div className="container mt-5">
      <div className="card shadow border-0 rounded-4 p-4">
        <h1 className="fw-bold text-primary mb-4 text-center">Dictation</h1>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">
              Câu {currentIndex + 1} / {segments.length}
            </small>
            <small className="text-muted">
              {
                Object.values(progressMap).filter(
                  (p) => p?.dictation?.completed,
                  // <-> p?.dictation?.completed === true (Truthy != Falsy)
                ).length
              }{" "}
              {/* Object không có thuộc tính .length */}
              hoàn thành
            </small>
          </div>
          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar"
              style={{
                width: `${((currentIndex + 1) / segments.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Audio player ẩn */}
        <audio ref={audioRef} src={`/api/audio/${lessonId}`} preload="auto" />
        {/* audio ref={audioRef}: audioRef trỏ thẳng vào thẻ <audio> này */}
        {/* preload="auto": tự động tải trước toàn bộ (hoặc nhiều nhất có thể) 
        dữ liệu của file âm thanh này vào bộ nhớ đệm (cache), ngay khi trang web vừa được nạp xong. */}

        {/* Play button */}
        <div className="text-center mb-4">
          <Button variant="outline" size="lg" onClick={playSegment}>
            ▶ Nghe câu {currentIndex + 1}
          </Button>
        </div>

        {/* Input */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Gõ những gì bạn nghe được
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!result) handleSubmit();
              }
            }}
            disabled={!!result}
            placeholder="Nhập câu trả lời..."
          />
        </div>

        {submitError && <div className="alert alert-danger">{submitError}</div>}

        {/* Kết quả */}
        {result ? (
          <div
            className={`alert ${result.completed ? "alert-success" : "alert-warning"} mb-3`}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{result.completed ? "✅ Đạt" : "❌ Chưa đạt"}</strong>
              <span className="fs-5 fw-bold">{result.score}%</span>
            </div>
            <p className="mb-1">
              <span className="text-muted">Đáp án: </span>
              <span className="fw-semibold">{segment.transcript.original}</span>
            </p>
            {segment.translation && (
              <p className="mb-0 text-muted fst-italic">
                {segment.translation}
              </p>
            )}
          </div>
        ) : (
          <Button
            variant="default"
            size="default"
            className="w-100"
            onClick={handleSubmit}
            disabled={submitting || !userInput.trim()}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Đang chấm...
              </>
            ) : (
              "Nộp"
            )}
          </Button>
        )}

        {/* Next / Finish */}
        {result && (
          <div className="d-flex gap-2 mt-3">
            {!result.completed && (
              <Button
                variant="outline"
                size="default"
                className="flex-fill"
                onClick={() => setResult(null)}
              >
                Thử lại
              </Button>
            )}
            <Button
              variant="default"
              size="default"
              className="flex-fill"
              onClick={
                isLast ? () => router.push(`/lessons/${lessonId}`) : handleNext
              }
            >
              {isLast ? (
                "Hoàn thành"
              ) : (
                <span className="d-flex align-items-center gap-2">
                  Câu tiếp theo <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
