import { useContext, useEffect, useRef, useState } from "react";
import { formatMessageTime } from "../utils/dateUtil";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import assets from "../assets";

function ChatContainer() {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();

  const [input, setInput] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ content: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if(scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-xl">
      {/*Header*/}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-indigo-600">
        <img
          src={selectedUser.profilePicture || assets.avatar}
          alt="User Avatar"
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-blue-600 flex items-center gap-2">
          {selectedUser.username}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow}
          alt="arrow"
          className="md:hidden max-w-7"
        />
        <img src={assets.info} alt="help" className="max-md:hidden max-w-5" />
      </div>

      {/*Chat Messages*/}
      <div className="flex flex-col h-[calc(100%_-_120px)] overflow-y-scroll p-3 pb-0">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              message.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            {message.image ? (
              <img
                className="max-w-[230px] border border-sky-700 rounded-lg overflow-hidden mb-8"
                src={message.image}
                alt="Message Attachment"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-words bg-sky-400 text-white ${
                  message.senderId !== authUser._id
                    ? "rounded-br-none"
                    : "rounded-bl-none"
                }`}
              >
                {message.content}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  message.senderId === authUser._id
                    ? authUser?.profilePicture || assets.avatar
                    : selectedUser?.profilePicture || assets.avatar
                }
                alt=""
                className="w-7 rounded-full"
              />
              <p className="text-sky-500">
                {formatMessageTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/*Input Area*/}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-sky-400/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            value={input}
            placeholder="Type a message..."
            className="flex-1  text-sm p-3 border-none rounded-lg outline-none text-indigo-600 placeholder-blue-700"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg, image/jpg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.attach}
              alt="Attach"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send}
          alt="Send"
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center  gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-blue-600">Chat anytime, anywhere</p>
    </div>
  );
}

export default ChatContainer;
