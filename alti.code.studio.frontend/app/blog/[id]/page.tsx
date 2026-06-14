import React from "react";
import Link from "next/link";
import Image from "next/image";

import Navbar from "@/components/navbar";
import PreFooter from "@/components/landing-page/pre-footer";

interface Comment {
  id: number;
  author: string;
  content: string;
  time: string;
  avatar: string;
}

interface SimilarPost {
  id: number;
  title: string;
  image: string;
}

const comments: Comment[] = [
  {
    id: 1,
    author: "Really nice post! I have applied these methods for daily.",
    content: "",
    time: "3 hours ago",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 2,
    author:
      "I have been reading online articles for web design and development for the past few days and I came across this article today. I just read and liked the content a lot, that I am for sure will be visiting your blog again and again. Thanks for it! I love how you shared the practical tips that can help us do better optimization. I will bookmark this post to be reading it multiple times.",
    content: "",
    time: "3 hours ago",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 3,
    author:
      "Thank you so much for these tips! I never thought these simple steps and trick will be so helpful!",
    content: "",
    time: "5 hours ago",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
  },
];

const similarPosts: SimilarPost[] = [
  {
    id: 1,
    title: "Destinations you want to visit next",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    title:
      "Do these every single day and you will become a more creative person",
    image:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    title: "How to be more productive? Here's why",
    image:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
  },
];

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const BlogDetailPage = async (props: PageProps) => {
  const { id } = await props.params;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button className="p-2 rounded-md hover:bg-gray-100 md:hidden">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>

              <div className="flex-1 flex justify-center">
                <Link
                  className="text-2xl font-bold text-gray-900 hover:text-gray-700"
                  href="#"
                >
                  Blogs
                </Link>
              </div>

              <div className="w-10 md:hidden" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white">
            {/* Title */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl  text-center font-bold text-gray-900 mb-4">
                How to be more productive?
              </h1>
            </header>

            {/* Featured Image */}
            <div className="mb-8">
              <Image
                priority
                alt="How to be more productive?"
                className="w-full h-64 md:h-80 object-cover rounded"
                height={400}
                src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                width={800}
              />
            </div>

            {/* Content */}
            <div className="prose prose-gray max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>

              <p className="text-gray-700 leading-relaxed mb-8">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>

            {/* Social Share */}
            <div className="flex items-center justify-between border-t border-b border-gray-200 py-4 mb-8">
              <span className="text-sm text-gray-600">What do you think?</span>
              <div className="flex space-x-3">
                <a className="text-gray-400 hover:text-gray-600" href="#">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a className="text-gray-400 hover:text-gray-600" href="#">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a className="text-gray-400 hover:text-gray-600" href="#">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a className="text-gray-400 hover:text-gray-600" href="#">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.73-3.016-1.788C4.89 14.47 4.646 13.739 4.646 12.988s.243-1.483.787-2.213c.567-1.058 1.719-1.788 3.016-1.788s2.448.73 3.016 1.788c.544.73.787 1.464.787 2.213s-.243 1.482-.787 2.212c-.568 1.058-1.719 1.788-3.016 1.788zm7.119 0c-1.297 0-2.448-.73-3.016-1.788-.544-.73-.787-1.463-.787-2.212s.243-1.483.787-2.213c.568-1.058 1.719-1.788 3.016-1.788s2.448.73 3.016 1.788c.544.73.787 1.464.787 2.213s-.243 1.482-.787 2.212c-.568 1.058-1.719 1.788-3.016 1.788z" />
                  </svg>
                </a>
                <a className="text-gray-400 hover:text-gray-600" href="#">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Comment Form */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add your comment..."
                  type="text"
                />
                <button className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
                  Comment
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-6 mb-12">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <Image
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    height={40}
                    src={comment.avatar}
                    width={40}
                  />
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed mb-1">
                      {comment.author}
                    </p>
                    <p className="text-xs text-gray-500">{comment.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Similar Posts */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Similar posts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarPosts.map((post) => (
                  <div key={post.id} className="group">
                    <Link href={`/blog/${post.id}`}>
                      <div className="mb-3">
                        <Image
                          alt={post.title}
                          className="w-full h-40 object-cover rounded group-hover:opacity-90 transition-opacity"
                          height={200}
                          src={post.image}
                          width={300}
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {post.title}
                      </h4>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </main>
      </div>
      <PreFooter />
    </>
  );
};

export default BlogDetailPage;

export async function generateStaticParams() {
  return [{ id: "1" }];
}
