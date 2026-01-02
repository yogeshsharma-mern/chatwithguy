import React, { useState, useRef, useEffect } from 'react';
import {
    FiSearch, FiPaperclip, FiSend, FiMoreVertical,
    FiVideo, FiPhone, FiCheck, FiImage,
    FiMic, FiUserPlus, FiSettings, FiMenu, FiX,
    FiChevronLeft, FiMessageSquare, FiClock
} from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiPut } from "../api/apiFetch";
import { useSelector } from 'react-redux';
import Ballpit from './Ballpit';
import {
    BsCheck2All,
    BsArrowLeft, BsFillMicFill
} from 'react-icons/bs';
import { FaRegCircle, FaCrown } from 'react-icons/fa';
import { IoIosArrowRoundBack, IoMdSend } from 'react-icons/io';
import { MdEmojiEmotions, MdAttachFile, MdPhotoCamera } from 'react-icons/md';
import { RiUserStarFill } from 'react-icons/ri';
import { TbMessageCircle } from 'react-icons/tb';
import apiPath from '../api/apipath';
import { apiGet } from '../api/apiFetch';
import socket from '../socket';

const ChatUI = () => {
    const { data: usersData, isLoading, isFetching, error, isError } = useQuery({
        queryKey: ["userdata"],
        queryFn: () => apiGet(apiPath.getconversations),
    });
    console.log("uusersdata", usersData)
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const value = useSelector((state) => state.auth);
    const myUserId = value?.user?._id;

    const { data: messagesData = [] } = useQuery({
        queryKey: ["messages", activeChat?._id],
        queryFn: () => apiGet(`${apiPath.getMessages}/${activeChat._id}`),
        enabled: !!activeChat?._id,
    });

    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatList, setShowChatList] = useState(true);
    const [userList, setUserList] = useState([]);
    console.log("showcahtList", showChatList);
    console.log("userlist", userList);
    const [showChatWindow, setShowChatWindow] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const queryClient = useQueryClient();
    // 🎙️ Voice recording refs & state
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [recording, setRecording] = useState(false);
const [recordingTime, setRecordingTime] = useState(0);
const [showRecordingBubble, setShowRecordingBubble] = useState(false);
const recordingTimerRef = useRef(null);
const [recordedBlob, setRecordedBlob] = useState(null);


    // useEffect(() => {
    //     console.log("🔥 onlineUsers from socket:", onlineUsers);
    // }, [onlineUsers]);

    useEffect(() => {
        if (!usersData) return;
        // if (usersData) {
        //     setUserList(
        //         // usersData.map(user => ({
        //         //     ...user,
        //         //     // lastMessage: "",
        //         //     // lastMessageAt: null,
        //         //     // unreadCount: 0,
        //         // }))
        //         usersData
        //     );
        setUserList(usersData);

    }, [usersData]);

    console.log("usersdata", usersData);
    console.log("userlist", userList);
    useEffect(() => {
        socket.on("connect", () => {
            console.log("✅ socket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("❌ socket disconnected");
        });
    }, []);


    useEffect(() => {
        if (!isMobileView && usersData && usersData.length > 0) {
            setActiveChat(usersData[0]);
        }
    }, [usersData, isMobileView]);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        setIsMobileView(isMobile);

        if (!isMobile) {
            setShowChatList(true);
            setShowChatWindow(true);
        }
    }, []);



    useEffect(() => {
        if (showChatWindow && isMobileView && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
        }
    }, [showChatWindow, isMobileView]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const isUserOnline = (userId) => onlineUsers.includes(userId);



    useEffect(() => {
        scrollToBottom();
    }, [messagesData]);
    // useEffect(() => {
    //     const handleMessagesSeen = ({ conversationId }) => {
    //         setUserList(prev =>
    //             prev.map(user =>
    //                 user.conversationId === conversationId
    //                     ? { ...user, unreadCount: 0 }
    //                     : user
    //             )
    //         );
    //     };

    //     socket.on("messages-seen", handleMessagesSeen);

    //     return () => {
    //         socket.off("messages-seen", handleMessagesSeen);
    //     };
    // }, []);


    useEffect(() => {
        if (!myUserId) return;

        socket.connect();
        socket.emit("setup", myUserId);

        const handleOnlineUsers = (users) => {
            setOnlineUsers(users);
        };

        socket.on("online-users", handleOnlineUsers);

        return () => {
            socket.off("online-users", handleOnlineUsers);
        };
    }, [myUserId]);


    useEffect(() => {
        const handleMessagesSeen = ({ conversationId }) => {
            if (
                !activeChat ||
                !showChatWindow ||
                activeChat.conversationId !== conversationId
            ) return;


            // ✅ update unread count in list
            setUserList(prev =>
                prev.map(user =>
                    user.conversationId === conversationId
                        ? { ...user, unreadCount: 0 }
                        : user
                )
            );

            // ✅ update message status in cache
            queryClient.setQueryData(
                ["messages", activeChat._id],
                (old = []) =>
                    old.map(msg =>
                        msg.senderId === myUserId && msg.status !== "seen"
                            ? { ...msg, status: "seen" }
                            : msg
                    )
            );

        };

        socket.on("messages-seen", handleMessagesSeen);
        return () => socket.off("messages-seen", handleMessagesSeen);
    }, [activeChat, myUserId, queryClient]);
    useEffect(() => {
        if (!activeChat) return;

        if (showChatWindow) {
            socket.emit("join-conversation", activeChat.conversationId);
        } else {
            socket.emit("leave-conversation", activeChat.conversationId);
        }

        return () => {
            socket.emit("leave-conversation", activeChat.conversationId);
        };
    }, [activeChat?.conversationId, showChatWindow]);




    // useEffect(() => {
    //     socket.on("new-message", (newMessage) => {
    //         if (activeChat?._id === newMessage.senderId) {
    //             queryClient.setQueryData(
    //                 ["messages", activeChat._id],
    //                 (old = []) => [...old, newMessage]
    //             );
    //         }
    //     });

    //     return () => {
    //         socket.off("new-message");
    //     };
    // }, [activeChat, queryClient]);
    // useEffect(() => {
    //     const handleConversationUpdate = (data) => {
    //         setUserList(prev =>
    //             prev
    //                 .map(user => {
    //                     // receiver side
    //                     if (user._id === data.senderId) {
    //                         return {
    //                             ...user,
    //                             lastMessage: data.lastMessage,
    //                             lastMessageAt: data.lastMessageAt,
    //                             unreadCount: data.unreadCount,
    //                         };
    //                     }

    //                     // sender side (my list)
    //                     if (user._id === data.receiverId) {
    //                         return {
    //                             ...user,
    //                             lastMessage: data.lastMessage,
    //                             lastMessageAt: data.lastMessageAt,
    //                         };
    //                     }

    //                     return user;
    //                 })
    //                 // 🔥 WhatsApp jaisa reorder
    //                 .sort(
    //                     (a, b) =>
    //                         new Date(b.lastMessageAt || 0) -
    //                         new Date(a.lastMessageAt || 0)
    //                 )
    //         );
    //     };

    //     socket.on("conversation-update", handleConversationUpdate);

    //     return () => {
    //         socket.off("conversation-update", handleConversationUpdate);
    //     };
    // }, []);
    useEffect(() => {
        const handleNewMessage = (newMessage) => {
            if (!activeChat) return;

            // 🔥 ignore my own message (already added by mutation)
            if (newMessage.senderId === myUserId) return;

            const isCurrentChat =
                newMessage.senderId === activeChat._id ||
                newMessage.receiverId === activeChat._id;

            if (isCurrentChat) {
                queryClient.setQueryData(
                    ["messages", activeChat._id],
                    (old = []) => [...old, newMessage]
                );
            }
        };

        socket.off("new-message");
        socket.on("new-message", handleNewMessage);
        return () => socket.off("new-message", handleNewMessage);
    }, [activeChat, queryClient]);

    useEffect(() => {
        const handleConversationUpdate = (data) => {
            setUserList(prev =>
                prev.map(user => {
                    // receiver side
                    if (user._id === data.senderId) {
                        const isActive =
                            activeChat?.conversationId === data.conversationId &&
                            showChatWindow;

                        return {
                            ...user,
                            lastMessage: data.lastMessage,
                            lastMessageAt: data.lastMessageAt,
                            unreadCount: isActive ? 0 : data.unreadCount,
                        };
                    }

                    // sender side
                    if (user._id === data.receiverId) {
                        return {
                            ...user,
                            lastMessage: data.lastMessage,
                            lastMessageAt: data.lastMessageAt,
                        };
                    }

                    return user;
                })
            );
        };


        socket.on("conversation-update", handleConversationUpdate);

        return () => {
            socket.off("conversation-update", handleConversationUpdate);
        };
    }, []);





    const sendMessageMutation = useMutation({
        mutationFn: (payload) =>
            apiPost(`${apiPath.sendMessage}/${activeChat._id}`, payload),
        onSuccess: (savedMessage) => {
            queryClient.setQueryData(
                ["messages", activeChat._id],
                (old = []) => [...old, savedMessage]
            );
            setMessage("");
        }
    });
    const sendVoiceMessage = async (audioBlob) => {
        if (!activeChat) return;

        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("type", "audio");

        await apiPost(
            `${apiPath.sendMessage}/${activeChat._id}`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
    };

    const sendMessage = () => {
        if (!message.trim() || !activeChat || sendMessageMutation.isLoading) return;
        sendMessageMutation.mutate({ message });
    };
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    setRecording(true);
    setShowRecordingBubble(true);
    setRecordingTime(0);

    // ⏱️ timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      clearInterval(recordingTimerRef.current);
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
  } catch (err) {
    console.error("Mic permission denied", err);
  }
};


const stopRecording = () => {
  if (!mediaRecorderRef.current) return;

  mediaRecorderRef.current.onstop = async () => {
    const blob = new Blob(audioChunksRef.current, {
      type: "audio/webm",
    });

    setRecordedBlob(blob); // store preview
  };

  mediaRecorderRef.current.stop();
  setRecording(false);
};


const cancelRecording = () => {
  if (!mediaRecorderRef.current) return;

  mediaRecorderRef.current.stop();
  audioChunksRef.current = [];

  clearInterval(recordingTimerRef.current);
  setRecording(false);
  setShowRecordingBubble(false);
};

    const getLastMessageForUser = (userId) => {
        const msgs = queryClient.getQueryData(["messages", userId]);
        if (!msgs || msgs.length === 0) return "Start a conversation...";
        const lastMsg = msgs[msgs.length - 1]?.message;
        return lastMsg.length > 30 ? lastMsg.substring(0, 30) + "..." : lastMsg;
    };

    // const formattedMessages = messagesData?.map((msg) => ({
    //     id: msg._id,
    //     text: msg.message,
    //     sender: msg.senderId === myUserId ? "me" : "them",
    //     time: new Date(msg.createdAt).toLocaleTimeString([], {
    //         hour: "2-digit",
    //         minute: "2-digit",
    //     }),
    // })) || [];
    const formattedMessages = messagesData?.map((msg) => ({
        id: msg._id,
        text: msg.message,
        audioUrl: msg.audioUrl,
        type: msg.type,
        sender: msg.senderId === myUserId ? "me" : "them",
        status: msg.status,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
    })) || [];


    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // const handleChatSelect = (chat) => {
    //     setActiveChat(chat);
    //     if (isMobileView) {
    //         setShowChatList(false);
    //         setShowChatWindow(true);
    //     }
    // };
    // const handleChatSelect = (chat) => {
    //   setActiveChat(chat);

    //   // 🔴 optimistic UI update
    //   setUserList(prev =>
    //     prev.map(u =>
    //       u._id === chat._id ? { ...u, unreadCount: 0 } : u
    //     )
    //   );

    //   // 🔴 backend update
    //   apiPut(`${apiPath.markSeen}/${chat._id}`);

    //   if (isMobileView) {
    //     setShowChatList(false);
    //     setShowChatWindow(true);
    //   }
    // };
    const handleChatSelect = (chat) => {
        setActiveChat(chat);

        // optimistic UI
        setUserList(prev =>
            prev.map(u =>
                u._id === chat._id ? { ...u, unreadCount: 0 } : u
            )
        );

        // ✅ correct ID
        apiPut(`${apiPath.markSeen}/${chat.conversationId}`);

        if (isMobileView) {
            setShowChatList(false);
            setShowChatWindow(true);
        }
    };


    const handleBackToChats = () => {
        if (isMobileView) {
            setShowChatList(true);
            setShowChatWindow(false);
        }
    };

    const filteredChats = usersData?.filter(chat =>
        chat.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.username?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const getChatListClasses = () => {
        if (isMobileView) {
            return !showChatWindow || !activeChat
                ? "fixed inset-0 z-50 flex flex-col"
                : "hidden";
        }
        return "flex flex-col w-full md:w-1/3 lg:w-1/4 xl:w-1/3";
    };

    const getChatWindowClasses = () => {
        if (isMobileView) {
            return showChatWindow
                ? "fixed inset-0 z-50 flex flex-col"
                : "hidden";
        }
        return activeChat
            ? "flex flex-col flex-1 w-full md:w-2/3 lg:w-3/4 xl:w-2/3"
            : "hidden";
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black to-[#3B006E]">
            {/* Animated Background - Matching Hero Section */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Ballpit
                    count={100}
                    gravity={0.01}
                    friction={0.9975}
                    wallBounce={0.95}
                    followCursor={true}
                    colors={["#5D009F", "#8B5CF6", "#A855F7", "#C084FC"]}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#3B006E]/60"></div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 h-screen flex">
                {/* Chat List Sidebar */}
                <div className={getChatListClasses()}>
                    <div className="flex flex-col h-full bg-gradient-to-b from-black/60 via-black/50 to-black/60 backdrop-blur-xl border-r border-[#5D009F]/30 shadow-2xl">
                        {/* Header */}
                        <div className="p-5 border-b border-[#5D009F]/30">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5D009F] to-[#8B5CF6] flex items-center justify-center shadow-lg">
                                            <TbMessageCircle className="text-2xl text-white" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-black flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">{usersData?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-[#C084FC] bg-clip-text text-transparent">
                                            Messages
                                        </h1>
                                        <p className="text-xs text-gray-400">Online: {onlineUsers.length} users</p>
                                    </div>
                                </div>
                                <button className="p-2.5 rounded-xl bg-[#5D009F]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 transition-all duration-300 group">
                                    <FiUserPlus className="text-xl text-[#C084FC] group-hover:text-white transition-colors" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[#12001f]/50 border border-[#5D009F]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A855F7]/50 focus:border-transparent text-white placeholder-gray-400 transition-all"
                                />
                            </div>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="space-y-2">

                                {userList.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => handleChatSelect(user)}
                                        className="px-4 py-2 rounded-2xl cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <img
                                                    src={user.profilePic}
                                                    alt={user.fullName}
                                                    className="w-14 h-14 rounded-2xl object-cover"
                                                />

                                                {isUserOnline(user._id) && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 
      bg-green-500 border-2 border-black rounded-full" />
                                                )}
                                            </div>


                                            {/* Chat Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-white text-sm truncate">
                                                        {user.fullName}
                                                    </h3>

                                                    <span className="text-xs text-gray-400">
                                                        {user.lastMessageAt &&
                                                            new Date(user.lastMessageAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-300 truncate">
                                                    {user.lastMessage || "Start a conversation"}
                                                </p>
                                            </div>

                                            {/* ✅ UNREAD BADGE */}
                                            {user.unreadCount > 0 && (
                                                <div className="min-w-[22px] h-[22px] px-2 rounded-full bg-purple-600 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white">
                                                        {user.unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>

                        {/* User Profile Footer */}
                        <div className="p-4 border-t border-[#5D009F]/30 bg-[#12001f]/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5D009F] to-[#8B5CF6] overflow-hidden border-2 border-white/20">
                                            <img
                                                src={value?.user?.profilePic}
                                                alt="You"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-black"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white text-sm">{value?.user?.fullName}</h4>
                                        <p className="text-xs text-gray-400">Online</p>
                                    </div>
                                </div>
                                <button className="p-2 rounded-lg bg-[#5D009F]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 transition-all">
                                    <FiSettings className="text-[#C084FC]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                {activeChat && (
                    <div className={getChatWindowClasses()}>
                        <div className="flex flex-col h-full bg-gradient-to-b from-black/60 via-black/50 to-black/60 backdrop-blur-xl">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-[#5D009F]/30 bg-gradient-to-r from-black/60 to-black/40">
                                <div className="flex items-center justify-between">
                                    {/* Left: User Info */}
                                    <div className="flex items-center gap-4">
                                        {isMobileView && (
                                            <button
                                                onClick={handleBackToChats}
                                                className="p-2 rounded-xl bg-[#5D009F]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 transition-all"
                                            >
                                                <BsArrowLeft className="text-xl text-white" />
                                            </button>
                                        )}
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5D009F] to-[#8B5CF6] p-0.5">
                                                <img
                                                    src={activeChat?.profilePic}
                                                    alt={activeChat?.fullName}
                                                    className="w-full h-full rounded-2xl object-cover"
                                                />
                                            </div>
                                            {isUserOnline(activeChat?._id) && (
                                                <div className="absolute bottom-0 right-0">
                                                    <div className="relative">
                                                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-black"></div>
                                                        <div className="absolute inset-0 animate-ping bg-emerald-500 rounded-full opacity-75"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-bold text-white text-lg">{activeChat?.fullName}</h2>
                                                {isUserOnline(activeChat?._id) && (
                                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                                                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
                                                        <span className="text-xs text-emerald-300">Online</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-300">
                                                {isUserOnline(activeChat?._id) ? "Active now" : "Last seen recently"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button className="p-3 rounded-xl bg-[#5D009F]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 transition-all group">
                                            <FiPhone className="text-xl text-gray-300 group-hover:text-white transition-colors" />
                                        </button>
                                        <button className="p-3 rounded-xl bg-[#5D009F]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 transition-all group">
                                            <FiVideo className="text-xl text-gray-300 group-hover:text-white transition-colors" />
                                        </button>
                                        <button className="p-3 rounded-xl bg-[#5D009F]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 transition-all group">
                                            <FiMoreVertical className="text-xl text-gray-300 group-hover:text-white transition-colors" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area - Enhanced Bubble Visibility */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                <div className="max-w-4xl mx-auto space-y-4">
                                    {/* Welcome Message */}
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5D009F]/20 to-[#8B5CF6]/20 border border-[#8B5CF6]/30">
                                            <RiUserStarFill className="text-[#C084FC]" />
                                            <span className="text-sm text-gray-300">
                                                Start of your conversation with {activeChat?.fullName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Messages - Enhanced Bubble Visibility */}
                                    {formattedMessages?.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} items-end gap-2 group`}
                                        >
                                            {/* Their Avatar */}
                                            {msg.sender === 'them' && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5D009F] to-[#8B5CF6] overflow-hidden">
                                                        <img
                                                            src={activeChat.profilePic}
                                                            alt={activeChat.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Message Bubble - Enhanced Visibility */}
                                            <div className={`relative ${msg.sender === 'me' ? 'order-2' : 'order-1'} max-w-[70%]`}>
                                                <div
                                                    className={`relative rounded-2xl px-4 py-3 shadow-lg ${msg.sender === 'me'
                                                        ? 'bg-gradient-to-r from-[#5D009F] to-[#8B5CF6] text-white rounded-br-lg border border-[#A855F7]/50 shadow-[#5D009F]/20'
                                                        : 'bg-[#1a0033]/90 text-gray-100 border border-[#5D009F]/30 rounded-bl-lg shadow-black/20 backdrop-blur-sm'
                                                        }`}
                                                >
                                                    {msg.type === "audio" ? (
                                                        <audio
                                                            controls
                                                            src={msg.audioUrl}
                                                            className="w-56"
                                                            onPlay={() =>
                                                                apiPut(`${apiPath.markSeen}/${activeChat.conversationId}`)
                                                            }
                                                        />
                                                    ) : (
                                                        <p className="text-sm leading-relaxed break-words font-medium">
                                                            {msg.text}
                                                        </p>
                                                    )}

                                                    {/* Enhanced Corner for better visibility */}
                                                    <div className={`absolute -bottom-2 ${msg.sender === 'me' ? '-right-2' : '-left-2'} w-4 h-4 ${msg.sender === 'me' ? 'bg-gradient-to-r from-[#5D009F] to-[#8B5CF6]' : 'bg-[#1a0033]'} transform rotate-45 border ${msg.sender === 'me' ? 'border-[#A855F7]/50' : 'border-[#5D009F]/30'}`}></div>
                                                </div>

                                                {/* Message Meta - Always visible now */}
                                                <div className={`flex items-center gap-2 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-xs text-gray-400 font-medium bg-black/20 px-2 py-0.5 rounded">
                                                        {msg.time}
                                                    </span>
                                                    {msg.sender === "me" && (
                                                        <>
                                                            {msg.status === "sent" && (
                                                                <FiCheck className="text-gray-400 text-sm" />
                                                            )}

                                                            {msg.status === "delivered" && (
                                                                <BsCheck2All className="text-gray-400 text-sm" />
                                                            )}

                                                            {msg.status === "seen" && (
                                                                <BsCheck2All className="text-blue-500 text-sm" />
                                                            )}
                                                        </>
                                                    )}

                                                </div>
                                            </div>

                                            {/* My Avatar */}
                                            {msg.sender === 'me' && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#C084FC] flex items-center justify-center shadow-md">
                                                        <span className="text-white text-xs font-bold">
                                                            {value?.user?.fullName?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Typing Indicator - Enhanced */}
                                    {isTyping && (
                                        <div className="flex justify-start items-end gap-2">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5D009F] to-[#8B5CF6]"></div>
                                            </div>
                                            <div className="bg-[#1a0033]/90 backdrop-blur-sm border border-[#5D009F]/30 rounded-2xl rounded-bl-lg px-5 py-3 shadow-black/20">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-[#C084FC] rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce delay-100"></div>
                                                    <div className="w-2 h-2 bg-[#5D009F] rounded-full animate-bounce delay-200"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
{showRecordingBubble && (
  <div className="flex items-center justify-between mb-3 px-4 py-3 rounded-2xl
    bg-gradient-to-r from-purple-600/20 to-pink-600/20
    border border-purple-500/30">

    {/* Left */}
    <div className="flex items-center gap-3">
      <BsFillMicFill className="text-red-500 text-xl animate-pulse" />
      <span className="text-sm text-white">{recordingTime}s</span>
    </div>

    {/* Right */}
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          sendVoiceMessage(recordedBlob);
          setRecordedBlob(null);
          setShowRecordingBubble(false);
        }}
        className="px-4 py-1.5 rounded-xl bg-green-600 text-white text-sm"
      >
        Send
      </button>

      <button
        onClick={cancelRecording}
        className="text-red-400 hover:text-red-200"
      >
        <FiX />
      </button>
    </div>
  </div>
)}


                            {/* Message Input */}
                            <div className="p-4 border-t border-[#5D009F]/30 bg-gradient-to-r from-black/60 to-black/40">
                                <div className="flex items-center gap-3">
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button className="p-3 rounded-xl bg-[#5D009F]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 transition-all group">
                                            <MdAttachFile className="text-xl text-gray-300 group-hover:text-white transition-colors" />
                                        </button>
                                        <button className="p-3 rounded-xl bg-[#5D009F]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 transition-all group">
                                            <MdPhotoCamera className="text-xl text-gray-300 group-hover:text-white transition-colors" />
                                        </button>
                                    </div>

                                    {/* Input Field */}
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={inputRef}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder={`Message ${activeChat?.fullName}...`}
                                            className="w-full px-5 py-3 bg-[#12001f]/60 border border-[#5D009F]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A855F7]/50 focus:border-transparent text-white placeholder-gray-400 resize-none transition-all min-h-[48px] max-h-[120px] backdrop-blur-sm"
                                            rows="1"
                                        />
                                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2">
                                            <MdEmojiEmotions className="text-xl text-gray-400 hover:text-[#C084FC] transition-colors" />
                                        </button>
                                    </div>

                                    <button
                                        onMouseDown={!message.trim() ? startRecording : sendMessage}
                                        onMouseUp={!message.trim() ? stopRecording : undefined}
                                        onTouchStart={!message.trim() ? startRecording : undefined}
                                        onTouchEnd={!message.trim() ? stopRecording : undefined}
                                        className={`p-4 rounded-2xl transition-all duration-300 ${recording
                                            ? "bg-red-600"
                                            : message.trim()
                                                ? "bg-gradient-to-r from-[#5D009F] to-[#8B5CF6]"
                                                : "bg-[#5D009F]/20"
                                            }`}
                                    >
                                        {message.trim() ? (
                                            <IoMdSend className="text-white text-xl" />
                                        ) : (
                                            <BsFillMicFill
                                                className={`text-xl ${recording ? "text-white animate-pulse" : "text-gray-300"}`}
                                            />
                                        )}
                                    </button>

                                </div>

                                {/* Quick Tips */}
                                {!isMobileView && (
                                    <div className="flex items-center justify-between mt-3 px-2">
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#C084FC] transition-colors">
                                                <FiImage className="text-lg" />
                                                <span>Photo</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#C084FC] transition-colors">
                                                <FiPaperclip className="text-lg" />
                                                <span>File</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#C084FC] transition-colors">
                                                <FaRegCircle className="text-lg" />
                                                <span>Record</span>
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Press <kbd className="px-2 py-1 bg-[#12001f]/60 rounded border border-[#5D009F]/30">Enter</kbd> to send •
                                            <kbd className="mx-1 px-2 py-1 bg-[#12001f]/60 rounded border border-[#5D009F]/30">Shift + Enter</kbd> for new line
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Empty State */}
                {isMobileView && !showChatList && !showChatWindow && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-8 max-w-sm">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#5D009F]/30 to-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#5D009F]/20">
                                <TbMessageCircle className="text-5xl text-[#C084FC]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-[#C084FC] bg-clip-text text-transparent">
                                Welcome to Messages
                            </h3>
                            <p className="text-gray-400 mb-6">Select a conversation or start a new one to begin messaging</p>
                            <button
                                onClick={() => setShowChatList(true)}
                                className="px-8 py-3 bg-gradient-to-r from-[#5D009F] to-[#8B5CF6] text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-[#5D009F]/25 transition-all hover:scale-105"
                            >
                                Browse Conversations
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatUI;