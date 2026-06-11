import DictationPage from "./dictation/page";

type LessonDetailPageProps = {
  params: {
    id: string;
  };
};

export default function LessonDetailPage({ params }: LessonDetailPageProps) {
  return (
    <div>
      <h2 className="text-center mt-4">Chi Tiết Bài Học {params.id}</h2>
      <DictationPage />
    </div>
  );
}
