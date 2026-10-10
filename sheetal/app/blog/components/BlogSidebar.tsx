"use client";
import React from "react";
import Link from "next/link";
import { Blog } from "@/app/services/blogService";

interface BlogSidebarProps {
  recentPosts: Blog[];
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({ recentPosts }) => {
  return (
    <div className="p-6 sticky top-24">
      <h4 className="text-[24px] text-[#70480c] mb-6 font-[family-name:var(--font-montserrat)] border-b border-gray-200 pb-2">
        Recent Articles
      </h4>
      {recentPosts.length === 0 ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ) : (
        <ul className="space-y-6">
          {recentPosts.map((post) => (
            <li
              key={post._id}
              className="group border-b border-gray-200 pb-4 hover:bg-gray-50 p-2 transition-colors"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <h5 className="text-[15px] font-[family-name:var(--font-montserrat)] group-hover:text-[#bd9951] transition-colors leading-snug mb-1">
                  {post.title}
                </h5>
                <p className="text-[15px] font-[family-name:var(--font-montserrat)]">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BlogSidebar;
