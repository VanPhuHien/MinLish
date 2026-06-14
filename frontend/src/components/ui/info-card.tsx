import type { ReactNode } from "react";

type InfoCardProps = {
  title: ReactNode;
  value: ReactNode;
};

export default function InfoCard({ title, value }: InfoCardProps) {
  return (
    <>
      <div className="info-card">
        <i className="ti ti-info" />
        <div>
          <div className="label">{title}</div>
          <div className="value">{value}</div>
        </div>
      </div>
    </>
  );
}
