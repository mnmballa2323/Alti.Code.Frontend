import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";

const ChatInput = () => {
  const [inputMessage, setInputMessage] = useState("");

  return (
    <div>
      <form>
        <div className="rounded-2xl border-2 border-gray-200 px-4 shadow-sm">
          <input
            className="w-full border-none px-2 py-2 outline-none z-20"
            placeholder="Prompt inso code"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <div className="flex justify-between py-2">
            <div className="flex items-center relative">
              <Plus className="cursor-pointer rounded-full border-2 border-gray-300 p-0.5" />
              <input
                type="file"
                // onChange={handleFileChange}
                className="opacity-0 absolute left-0 w-[24px] cursor-pointer"
              />
            </div>
            <button
              className="flex items-center justify-center cursor-pointer rounded-md bg-black text-white h-7 w-7 hover:bg-gray-800 transition-colors shadow-sm"
              type="submit"
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
