"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

interface BlogBannerProps {
  title: string;
  image: string;
}

const BlogBanner: React.FC<BlogBannerProps> = ({ title, image }) => {
  return (
    <>
      <div className="relative w-full h-[400px] md:h-[500px] mt-[40px] md:mt-[75px] overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover" priority />
      </div>
      <div>
        <div className="flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-[26px] md:text-[35px] text-[#69460c] mb-4 mt-10 font-[family-name:var(--font-optima)] max-w-4xl leading-tight">
            {title}
          </h1>
          <nav className="text-sm md:text-base text-gray-600 font-light tracking-wide">
            <ul className="flex items-center gap-2">
              <li>
                <Link
                  href="/"
                  className="text-[#6a3f07] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li className=" text-[#6a3f07]">/</li>
              <li>
                <Link
                  href="/blogs"
                  className="text-[#6a3f07] transition-colors"
                >
                  Blogs
                </Link>
              </li>
              <li className=" text-[#6a3f07]">/</li>
              <li className="line-clamp-1 text-[#6a3f07] max-w-[200px] md:max-w-none">
                {title}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default BlogBanner;
