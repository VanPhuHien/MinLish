type ShadowingPageProps = {
  params: {
    id: string;
  };
};

export default function ShadowingPage({ params }: ShadowingPageProps) {
  return (
    <div>
      <h2>Luyện Nói Shadowing - Bài {params.id}</h2>
      {/* TODO: Implement Shadowing Recorder and Comparison */}
    </div>
  );
}
