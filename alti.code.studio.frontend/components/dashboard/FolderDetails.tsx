import React from "react";

export default function FolderDetails({ folder }: { folder: any }) {
  if (!folder) return null;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Folder: {folder.name}</h2>
      {folder.children && folder.children.length > 0 ? (
        <ul className="list-disc ml-6">
          {folder.children.map((item: any, idx: number) => (
            <li key={idx} className="mb-2">
              <span className="font-medium">{item.name}</span>{" "}
              <span className="text-xs text-gray-500">({item.type})</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">This folder is empty.</p>
      )}
    </div>
  );
}
