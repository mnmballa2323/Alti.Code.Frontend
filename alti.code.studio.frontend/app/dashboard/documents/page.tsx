"use client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Icon } from "@iconify/react";
import React, { useRef, useState } from "react";

import { documentsDummyData } from "@/lib/documents-dummy-data";
import { SearchIcon } from "@/components/icons";
import DeleteModal from "@/components/delete";
import { DeleteFilledIcon } from "@/components/dashboard/dashboard-table/delete";

function DocumentsPage() {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(documentsDummyData);
  const [history, setHistory] = useState<any[]>([]);
  const [folderName, setFoldername] = useState("");
  const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);
  const [isDeleteFolder, setIsDeleteFolder] = useState(false);
  const [isFileOpen, setFileOpen] = useState(false);
  const [file, setFile] = useState("");

  // States for text editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");

  const handleEnterFolder = (folder: any) => {
    if (folder.type === "folder") {
      setFoldername(folder.name);
      if (folder.children) {
        setHistory([...history, { folder: currentFolder, name: folder.name }]);
        setCurrentFolder(folder.children);
      }
    } else if (folder.type === "file") {
      setFileOpen(true);
      setFile(folder.href || "#");
    }
  };

  const handleGoBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];

    setCurrentFolder(prev.folder);
    setHistory(history.slice(0, history.length - 1));
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileFocus = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
    }
  };

  const handleCloseDeleteModel = () => {
    setIsDeleteModelOpen(false);
    setIsDeleteFolder(false);
  };

  // Text editor functions
  const handleCreateFile = () => {
    setIsEditorOpen(true);
    setEditorContent("");
    setDocumentTitle("");
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditorContent("");
    setDocumentTitle("");
  };

  const handleSavePDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(documentTitle || "Untitled Document", 20, 30);

    // Add content
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(editorContent, 170);

    doc.text(lines, 20, 50);

    // Save the PDF
    const fileName = `${documentTitle || "untitled"}.pdf`;

    doc.save(fileName);

    // Add to current folder (mock functionality)
    const newDoc: any = {
      name: fileName,
      type: "file",
      href: "#",
    };

    setCurrentFolder([...currentFolder, newDoc]);

    handleCloseEditor();
  };

  const handleItemClick = (item: any, index: number) => {
    // Prevent any potential event bubbling issues

    handleEnterFolder(item);
  };

  const handleDeleteClick = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModelOpen(true);
  };

  return (
    <div
      className="w-full h-full p-6 relative"
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex items-center gap-3 mb-6">
        {history.length > 0 && (
          <Icon
            className="w-10 h-10 cursor-pointer hover:opacity-70 transition-opacity"
            icon={"cuida:arrow-left-outline"}
            onClick={handleGoBack}
          />
        )}
        <h1 className="text-4xl font-[700] leading-[32px]">
          {history.length > 0 ? folderName : "Files"}
        </h1>
      </div>

      <div className="flex items-center justify-between mb-8">
        <Input
          className="w-[500px]"
          endContent={<SearchIcon className="text-default-400" width={16} />}
          placeholder="Search"
          size="lg"
        />
        <div className="flex items-center gap-5">
          {history.length > 0 ? (
            <div className="flex gap-5">
              <Button
                className="bg-default-100 text-black"
                onClick={handleCreateFile}
              >
                Create file
              </Button>
              <Button
                className="bg-default-100 text-black"
                onClick={handleFileFocus}
              >
                Upload file
              </Button>
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <Button
              className="bg-black text-white"
              onClick={() => setIsModelOpen(true)}
            >
              New folder
            </Button>
          )}
        </div>
      </div>

      {/* Main content area with explicit click handling */}
      <div
        className={`flex overflow-y-auto w-full ${
          history.length > 0
            ? "flex-col gap-2 h-[calc(100vh_-_220px)]"
            : "flex-row flex-wrap gap-5 h-[calc(100vh_-_180px)]"
        }`}
      >
        {currentFolder && currentFolder.length > 0 ? (
          currentFolder.map((item, index) => (
            <div
              key={`item-${index}-${item?.name || "unnamed"}`}
              className={`flex items-center cursor-pointer transition-all duration-200 ${
                item.type === "folder"
                  ? "bg-default-100 w-40 h-40 rounded-2xl p-2 flex-col justify-center hover:bg-default-200"
                  : "w-full h-fit flex-row bg-default-100 py-4 ps-2 pe-4 justify-between hover:bg-default-200"
              }`}
              role="button"
              tabIndex={0}
              onClick={() => handleItemClick(item, index)}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleItemClick(item, index);
                }
              }}
            >
              <div className="flex gap-3 items-center pointer-events-none">
                {item.type === "file" && (
                  <Icon className="w-5 h-5" icon={"heroicons:document"} />
                )}
                <p
                  className={`font-medium w-full break-words ${
                    item.type === "folder"
                      ? "text-black text-center"
                      : "text-black text-start"
                  }`}
                >
                  {item.name || "Unnamed"}
                </p>
              </div>
              {item.type === "file" && (
                <div
                  className="pointer-events-auto"
                  onClick={(e) => handleDeleteClick(e, item)}
                >
                  <DeleteFilledIcon
                    className="cursor-pointer text-default-400 hover:text-red-500 transition-colors"
                    height={20}
                    width={20}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            <p>No files or folders to display</p>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {isModelOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div
            className="absolute inset-0 bg-default-100/50"
            onClick={() => setIsModelOpen(false)}
          />
          <div className="bg-default-50 rounded-xl p-4 w-full max-w-md shadow-lg relative flex flex-col gap-6 z-10">
            <Icon
              className="absolute top-3 right-3 dark:text-black text-black cursor-pointer w-5 h-5"
              icon="ei:close"
              onClick={() => setIsModelOpen(false)}
            />
            <h2 className="font-medium text-base">Create Folder</h2>
            <Input label="Folder Name" size="sm" variant="bordered" />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                className="text-black bg-white border-[1px] border-black"
                onClick={() => setIsModelOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="dark:bg-white dark:text-black bg-default-100 text-black"
                onClick={() => setIsModelOpen(false)}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Text Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div
            className="absolute inset-0 bg-default-100/50"
            onClick={handleCloseEditor}
          />
          <div className="bg-default-50 rounded-xl p-4 w-full max-w-4xl max-h-[90vh] shadow-lg relative flex flex-col gap-6 z-10">
            <Icon
              className="absolute top-3 right-3 dark:text-black text-black cursor-pointer w-5 h-5"
              icon="ei:close"
              onClick={handleCloseEditor}
            />
            <h2 className="font-medium text-base">Create New Document</h2>
            <Input
              label="Document Title"
              size="sm"
              value={documentTitle}
              variant="bordered"
              onChange={(e) => setDocumentTitle(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm">Content</label>
              <textarea
                className="w-full h-64 p-3 border border-default-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start writing your document..."
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button
                className="text-black bg-white border-[1px] border-black"
                onClick={handleCloseEditor}
              >
                Cancel
              </Button>
              <Button
                className="dark:bg-white dark:text-black bg-default-100 text-black"
                disabled={!documentTitle.trim() || !editorContent.trim()}
                onClick={handleSavePDF}
              >
                Save as PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModelOpen}
        title="file"
        onClose={handleCloseDeleteModel}
        onLogout={handleCloseDeleteModel}
      />
      <DeleteModal
        isOpen={isDeleteFolder}
        title="entire folder"
        onClose={handleCloseDeleteModel}
        onLogout={handleCloseDeleteModel}
      />

      {/* File Preview Modal */}
      {isFileOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div
            className="absolute inset-0 bg-default-100/50"
            onClick={() => setFileOpen(false)}
          />
          <div className="flex items-center justify-center w-full h-full p-8">
            <iframe
              className="bg-white w-full h-full max-w-6xl max-h-full rounded-lg"
              src={file || "#"}
              title="File Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentsPage;
