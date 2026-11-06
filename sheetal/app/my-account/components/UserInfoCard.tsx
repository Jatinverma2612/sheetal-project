"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getApiImageUrl } from "../../services/api";

interface UserInfoCardProps {
  user: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    profilePicture?: string;
  } | null;
  onSelectSection: (section: string) => void;
}

const getUserInitials = (name?: string, email?: string): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return "U";
};

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  user,
  onSelectSection,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.profilePicture]);

  if (!user) return null;

  const rawPic = user.profilePicture?.trim();
  const hasCustomPic = Boolean(
    rawPic &&
      rawPic !== "/assets/default-image.png" &&
      rawPic !== "default-image.png"
  );
  const profileImageSrc = hasCustomPic ? getApiImageUrl(rawPic, "") : "";

  return (
    <div className="col-lg-12">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1b3d2f] text-[#f5eaac] flex-shrink-0 flex items-center justify-center font-semibold text-lg border border-amber-900/10 shadow-sm select-none">
          {profileImageSrc && !imgError ? (
            <Image
              src={profileImageSrc}
              alt={user.name ? `${user.name}'s profile` : "User profile"}
              width={64}
              height={64}
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{getUserInitials(user.name, user.email)}</span>
          )}
        </div>
        <div>
          <h4 className="text-xl font-semibold uppercase">Account</h4>
          <div className="flex flex-wrap gap-x-4 text-sm">
            {user.name && <span>{user.name}</span>}
            {user.phoneNumber && (
              <>
                <p className="font-semibold">Phone No:</p>
                <span>{user.phoneNumber}</span>
              </>
            )}
            {user.email && (
              <>
                <p className="font-semibold">Email ID:</p>
                <span>{user.email}</span>
              </>
            )}
          </div>
          <div className="mt-2">
            <button
              onClick={() => onSelectSection("edit-profile")}
              className="border p-1 px-2 text-sm rounded-[2px] cursor-pointer border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      <hr className="my-4 border-t border-gray-200" />
    </div>
  );
};

export default UserInfoCard;
