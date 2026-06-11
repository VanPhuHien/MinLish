"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axios";
import useAuthStore from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import "./profile.css";
import InfoCard from "@/components/ui/info-card";
import LoadAnimation from "@/components/ui/load-animation";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/user/profile`);
        setProfile(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể lấy thông tin user");
      }
    };
    fetchProfile();
  }, [user, router, mounted]);

  if (!mounted)
    return (
      <LoadAnimation />
    );

  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow">{error}</div>
      </div>
    );
  if (!profile)
    return (
      <LoadAnimation />
    );

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN"); // Định dạng theo kiểu Việt Nam
  };

  return (
    <div className="profile-wrap">
      <div className="profile-card">
        <div className="profile-banner">
          <div className="avatar-wrap">
            <img
              className="avatar-img"
              src={
                profile?.imagePresignedUrl ||
                `https://ui-avatars.com/api/?name=${profile.username}`
              }
              alt="Avatar"
            />
          </div>
        </div>

        <div className="profile-header d-flex justify-content-between align-items-center">
          <div className="header-info d-flex flex-column">
            <span className="name mr-2 fw-bold fs-4">
              {profile.profile?.fullname || profile.username}
            </span>
            <span className="username d-flex align-items-center text-muted">
              @{profile.username}
              <span className="badge-role ml-2">
                <i className="ti ti-shield-check" />
                {profile.role}
              </span>
            </span>
          </div>
          <button
            className="edit-btn"
            onClick={() => router.push("/profile/edit")}
          >
            <i className="ti ti-edit" /> Cập nhật hồ sơ
          </button>
        </div>

        {/* Thông tin chi tiết */}
        <div className="profile-body">
          <div className="info-grid three-col">
            <InfoCard title={"Email"} value={profile.email} />
            <InfoCard
              title={"Điện thoại"}
              value={profile.profile?.phone || "Chưa cập nhật"}
            />
            <InfoCard
              title={"Giới tính"}
              value={
                profile.profile?.gender === "MALE"
                  ? "Nam"
                  : profile.profile?.gender === "FEMALE"
                    ? "Nữ"
                    : "Chưa cập nhật"
              }
            />
          </div>

          <div className="info-grid two-col">
            <InfoCard title={"Ngày sinh"} value={formatDate(profile.profile?.birthday)} />
            <InfoCard title={"Tiểu sử"} value={profile.profile?.bio || "Chưa cập nhật"} />
          </div>
        </div>
      </div>
    </div>
  );
}
