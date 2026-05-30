import React from "react";

export const MarkdownChats = {
  h1({ children }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
      <h1 className="font-extrabold text-2xl mt-4 mb-2 text-black dark:text-white">
        {children}
      </h1>
    );
  },
  h2({ children }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
      <h2 className="font-bold text-xl mt-4 mb-2 text-black dark:text-white">
        {children}
      </h2>
    );
  },
  h3({ children }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
      <h3 className="font-semibold text-lg mt-3 mb-2 text-gray-800 dark:text-gray-200">
        {children}
      </h3>
    );
  },
  ul({ children }: React.HTMLAttributes<HTMLUListElement>) {
    return (
      <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
        {children}
      </ul>
    );
  },
  ol({ children }: React.HTMLAttributes<HTMLOListElement>) {
    return (
      <ol className="list-decimal ml-6 space-y-2 text-gray-800 dark:text-gray-200">
        {children}
      </ol>
    );
  },
  li({ children }: React.HTMLAttributes<HTMLLIElement>) {
    return <li className="text-gray-800 dark:text-gray-200">{children}</li>;
  },
  blockquote({ children }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
    return (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/50 py-2 px-3 rounded-md">
        {children}
      </blockquote>
    );
  },
  table({ children }: React.TableHTMLAttributes<HTMLTableElement>) {
    return (
      <div className="overflow-x-auto my-4">
        <table className="table-auto border-collapse border border-gray-300 dark:border-gray-600 w-full text-gray-800 dark:text-gray-200">
          {children}
        </table>
      </div>
    );
  },
  th({ children }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return (
      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-left font-bold dark:text-white">
        {children}
      </th>
    );
  },
  td({ children }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return (
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
        {children}
      </td>
    );
  },
  code({ children }: React.HTMLAttributes<HTMLElement>) {
    return (
      <code className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md font-mono text-sm font-medium">
        {children}
      </code>
    );
  },
  pre({ children }: React.HTMLAttributes<HTMLPreElement>) {
    return (
      <pre className="text-white p-4 rounded-lg overflow-x-auto">
        <code className="text-sm">{children}</code>
      </pre>
    );
  },
  p({ children }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
      <p className="text-black dark:text-white my-2 leading-relaxed">
        {children}
      </p>
    );
  },
  hr(_: React.HTMLAttributes<HTMLHRElement>) {
    return <hr className="my-4 border-gray-300 dark:border-gray-600" />;
  },
  strong({ children }: React.HTMLAttributes<HTMLElement>) {
    return (
      <strong className="font-semibold text-black dark:text-white">
        {children}
      </strong>
    );
  },
  em({ children }: React.HTMLAttributes<HTMLElement>) {
    return <em className="italic">{children}</em>;
  },
  del({ children }: React.HTMLAttributes<HTMLElement>) {
    return (
      <del className="line-through text-red-500 dark:text-red-400">
        {children}
      </del>
    );
  },
  a({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {children}
      </a>
    );
  },
};
