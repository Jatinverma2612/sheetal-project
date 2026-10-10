import React from "react";
import Link from "next/link";
import Image from "next/image";

interface DashboardLinkCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
}

const DashboardLinkCard: React.FC<DashboardLinkCardProps> = ({
  href,
  icon,
  title,
  description,
}) => {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center border border-gray-200 hover:border-[#ac8037] rounded-md p-6 text-center transition-colors"
    >
      <Image
        src={icon}
        alt={title}
        width={40}
        height={40}
        className="mb-4 opacity-90"
      />

      <h5 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
        {title}
      </h5>

      <p className="mt-1 text-xs text-gray-500 max-w-[160px]">{description}</p>
    </Link>
  );
};

export default DashboardLinkCard;
