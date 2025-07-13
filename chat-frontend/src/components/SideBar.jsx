import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import assets from "../assets";

function SideBar() {
  const {
    getUsers,
    Users,
    unseenMessages,
    setUnseenMessages,
    selectedUser,
    setSelectedUser,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");

  const navigate = useNavigate();

  const filteredUsers = Users.filter((user) => {
    if (input === "") return true;
    return user.username.toLowerCase().includes(input.toLowerCase());
  }).sort((a, b) => {
    const aUnseen = unseenMessages[a._id] || 0;
    const bUnseen = unseenMessages[b._id] || 0;
    return bUnseen - aUnseen;
  });

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      className={`bg-blue-500 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      } `}
    >
      <div className="pb-5">
        <div className="flex items-center justify-between">
          <img src={assets.logo} alt="Logo" className="max-w-8" />
          <h1 className="text-xl font-semibold">Chat App</h1>
          <div className="relative py-2 group">
            <img
              src={assets.more}
              alt="avatar"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-white border border-blue-600 shadow-lg text-blue-600 hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-indigo-500" />
              <p onClick={() => logout()} className="cursor-pointer text-sm">
                Logout
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-full flex items-center gap-2 px-4 py-3 mt-5">
          <img src={assets.search} alt="search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-blue-600 text-xs placeholder-blue-700 flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {filteredUsers.map((user, index) => (
          <div
            onClick={() => {
              setSelectedUser(user),
                setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
            }}
            key={index}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id && "bg-white"
            }`}
          >
            <img
              src={user?.profilePicture || assets.avatar}
              alt=""
              className="w-[35px] aspect-[1/1] rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p className="text-sky-300">{user.username || "User"}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-xs text-green-500">Online</span>
              ) : (
                <span className="text-xs text-red-600">Offline</span>
              )}
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500-50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
