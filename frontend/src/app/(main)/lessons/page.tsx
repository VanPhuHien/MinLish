import Link from "next/link";

export default function LessonsPage() {
  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-primary mb-4">Danh Sách Bài Học</h2>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
            <h5 className="fw-bold">Bài học số 1</h5>
            <p className="text-muted">
              Luyện nghe chép chính tả đoạn văn tiếng Anh mẫu.
            </p>
            <Link
              href="/lessons/aaaaaaaaaaaaaaaaaaaaaaaa"
              className="btn btn-primary mt-auto"
            >
              Vào học ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
