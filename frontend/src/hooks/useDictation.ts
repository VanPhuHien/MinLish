// custom hook = gom các Hook cơ bản (useState, useEffect,..)
// -> tách biệt hoàn toàn phần "Logic xử lý dữ liệu" ra khỏi phần "Giao diện hiển thị"
import { useState, useEffect } from "react";
import axiosInstance from "@/services/axios"; //@ -> thư mục gốc src/

export type DictationSegment = {
  _id: string;
  startMs: number;
  endMs: number;
  transcript: {
    original: string;
  };
  translation?: string;
};

export type SegmentProgress = {
  segmentId: string;
  dictation?: {
    completed?: boolean;
  };
  [key: string]: unknown;
};

export type DictationSubmitResult = {
  score: number;
  completed: boolean;
};

export default function useDictation(lessonId?: string) {
  const [segments, setSegments] = useState<DictationSegment[]>([]);
  const [progressMap, setProgressMap] = useState<
    Record<string, SegmentProgress>
  >({});
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lessonId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [segmentsResult, progressResult] = await Promise.all([
          axiosInstance.get(`/lessons/${lessonId}/segments`),
          axiosInstance
            .get(`/users/me/lessons/${lessonId}/segments-progress`)
            .catch(() => ({ data: { data: [] } })), //test
          //axiosInstance.get(`/users/me/lessons/${lessonId}/segments-progress`),//real
        ]);
        const segments = segmentsResult.data.data as DictationSegment[];
        const progressList = (progressResult.data.data ||
          []) as SegmentProgress[]; //test
        //const progressList = progressResult.data.data || [];//real

        const map = Object.fromEntries(
          progressList.map((p) => [p.segmentId, p]),
        ) as Record<string, SegmentProgress>;
        // Object.fromEntries(...): gom mảng các cặp [key, value] thành một Object duy nhất
        // Tối ưu hóa tốc độ tìm kiếm dữ liệu (từ O(N) xuống O(1)) nhờ [key, value]

        // Tìm segment chưa completed đầu tiên để Resume (tiếp tục học)
        const firstIncomplete = segments.findIndex(
          (s) => !map[s._id]?.dictation?.completed,
        );
        // Trường hợp A: Segment này ĐÃ hoàn thành rồi -> !true -> findIndex bỏ qua, tìm tiếp cái sau
        // Trường hợp B: Segment này ĐÃ LÀM nhưng THẤT BẠI (chưa xong) -> !false -> findIndex dừng lại lấy vị trí này
        // Trường hợp C: Segment này CHƯA TỪNG ĐƯỢC LÀM -> !underfined = true -> findIndex dừng lại lấy vị trí này

        setSegments(segments);
        setProgressMap(map);
        setStartIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
      } catch (err: any) {
        setError(err.response?.data?.message || "Can't load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const submitSegment = async (
    segmentId: string,
    userInput: string,
  ): Promise<DictationSubmitResult> => {
    const res = await axiosInstance.patch(
      `/dictation/users/me/lessons/${lessonId}/segments/${segmentId}/progress`,
      { mode: "dictation", userInput },
    );
    const { score, completed, progress } = res.data.data; //.data thứ nhất là của axios, thứ 2 của dev

    // Cập nhật progressMap local, không fetch lại toàn bộ
    // => vs nộp bài câu 5 -> set tiến độ mới của riêng câu 5 hiển thị -> ko fetch lại 50 câu
    setProgressMap((prev) => ({ ...prev, [segmentId]: progress }));

    return { score, completed };
  };

  return { segments, progressMap, startIndex, loading, error, submitSegment };
}
