import React, { useState, useRef, useEffect } from 'react';
import {
    FiSearch, FiPaperclip, FiSend, FiMoreVertical,
    FiVideo, FiPhone, FiCheck, FiImage,
    FiMic, FiUserPlus, FiSettings, FiMenu, FiX,
    FiChevronLeft, FiMessageSquare
} from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "../api/apiFetch";
import { useSelector } from 'react-redux';
import {
    BsThreeDots, BsDot, BsCheck2All, BsCameraVideo,
    BsTelephone, BsArrowLeft
} from 'react-icons/bs';
import {
    HiOutlinePhotograph, HiOutlinePaperClip,
    HiOutlineEmojiHappy, HiOutlineMicrophone
} from 'react-icons/hi';
import { FaRegCircle } from 'react-icons/fa';
import { IoIosArrowRoundBack, IoMdSend } from 'react-icons/io';
import { MdEmojiEmotions, MdAttachFile } from 'react-icons/md';
import apiPath from '../api/apipath';
import { apiGet } from '../api/apiFetch';
import { act } from 'react';
import socket from '../socket';
// Static data for chat
const staticChatData = [
    {
        id: 1,
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        lastMessage: "Meeting at 3 PM tomorrow",
        time: "10:30 AM",
        unread: 2,
        online: true,
        messages: [
            { id: 1, text: "Hey there! How's the project going?", time: "10:15 AM", sender: "them", status: "read" },
            { id: 2, text: "Going well! Just finished the UI components", time: "10:18 AM", sender: "me", status: "read" },
            { id: 3, text: "That's great! Can you share the Figma link?", time: "10:20 AM", sender: "them", status: "read" },
            { id: 4, text: "Sure, sending it now", time: "10:25 AM", sender: "me", status: "read" },
            { id: 5, text: "Meeting at 3 PM tomorrow to review everything", time: "10:30 AM", sender: "them", status: "delivered" }
        ]
    },
    {
        id: 2,
        name: "Sarah Miller",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        lastMessage: "Thanks for the feedback!",
        time: "Yesterday",
        unread: 0,
        online: true,
        messages: [
            { id: 1, text: "The design looks amazing!", time: "Yesterday", sender: "me", status: "read" },
            { id: 2, text: "Thanks for the feedback! Really appreciate it", time: "Yesterday", sender: "them", status: "read" }
        ]
    },
    {
        id: 3,
        name: "Design Team",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DesignTeam",
        lastMessage: "Mike: Updated the color palette",
        time: "2 days ago",
        unread: 5,
        online: false,
        messages: [
            { id: 1, text: "Team meeting notes uploaded", time: "2 days ago", sender: "them", status: "read" },
            { id: 2, text: "Updated the color palette based on feedback", time: "2 days ago", sender: "them", status: "read" }
        ]
    },
    {
        id: 4,
        name: "David Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        lastMessage: "See you at the conference",
        time: "1 week ago",
        unread: 0,
        online: false,
        messages: [
            { id: 1, text: "Looking forward to the tech conference!", time: "1 week ago", sender: "me", status: "read" },
            { id: 2, text: "See you at the conference!", time: "1 week ago", sender: "them", status: "read" }
        ]
    }
];




const ChatUI = () => {

    const { data: usersData, isLoading, isFetching, error, isError } = useQuery({
        queryKey: ["userdata"],
        queryFn: () =>
            apiGet(apiPath.getallUsers),
    });
    console.log("usesrsdata", usersData)
    const [chats, setChats] = useState(staticChatData);
    const [activeChat, setActiveChat] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const value = useSelector((state) => state.auth);
    const myUserId = value?.user?._id;
    console.log("value", value)

    const { data: messagesData = [] } = useQuery({
        queryKey: ["messages", activeChat?._id],
        queryFn: () =>
            apiGet(`${apiPath.getMessages}/${activeChat._id}`),
        enabled: !!activeChat?._id, // VERY IMPORTANT
    });
    console.log("messagesdata", messagesData)

    console.log("activechat", activeChat);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatList, setShowChatList] = useState(true);
    const [showChatWindow, setShowChatWindow] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Desktop pe auto open chat
        if (!isMobileView && usersData && usersData.length > 0) {
            setActiveChat(usersData[0]);
        }
    }, [usersData, isMobileView]);

    // Detect viewport size and manage layout
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        setIsMobileView(isMobile);

        if (!isMobile) {
            setShowChatList(true);
            setShowChatWindow(true);
        }
    }, []);


    // Auto-focus input when chat window opens on mobile
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
            // ❌ DO NOT DISCONNECT HERE on mobile
        };
    }, [myUserId]);

    useEffect(() => {
        socket.on("new-message", (newMessage) => {
            console.log("newmessages", newMessage)
            // Sirf active chat ka message add karo
            if (activeChat?._id === newMessage.senderId) {
                queryClient.setQueryData(
                    ["messages", activeChat._id],
                    (old = []) => [...old, newMessage]
                );
            }
        });

        return () => {
            socket.off("new-message");
        };
    }, [activeChat]);

    const queryClient = useQueryClient();

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

    const sendMessage = () => {
        if (!message.trim() || !activeChat) return;

        sendMessageMutation.mutate({
            // receiverId: activeChat._id || activeChat.id,
            message,
        });
    };
    const getLastMessageForUser = (userId) => {
        const msgs = queryClient.getQueryData(["messages", userId]);
        console.log("msgs", msgs)
        if (!msgs || msgs.length === 0) return "No messages yet";
        return msgs[msgs.length - 1]?.message;
    };

    const formattedMessages = messagesData.map((msg) => ({
        id: msg._id,
        text: msg.message,
        sender: msg.senderId === myUserId ? "me" : "them",
        time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
    }));

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

const handleChatSelect = (chat) => {
    setActiveChat(chat);
    
    // Update unread count to 0
    // const updatedChats = chats.map(c => 
    //   c.id === chat.id ? { ...c, unread: 0 } : c
    // );
    // setChats(updatedChats);

    if (isMobileView) {
        setShowChatList(false);
        setShowChatWindow(true);
    } else {
        // On desktop, ensure both are visible
        setShowChatList(true);
        setShowChatWindow(true);
    }
};

    const handleBackToChats = () => {
        if (isMobileView) {
            setShowChatList(true);
            setShowChatWindow(false);
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Responsive layout classes
    // const getChatListClasses = () => {
    //     if (isMobileView) {
    //         return showChatList
    //             ? "fixed inset-0 z-50 bg-white flex flex-col"
    //             : "hidden";
    //     }
    //     return "flex flex-col w-full md:w-1/3 lg:w-1/4 xl:w-1/3 border-r border-gray-200";
    // };
const getChatListClasses = () => {
    if (isMobileView) {
        // On mobile, show chat list only when chat window is not showing
        return !showChatWindow || !activeChat
            ? "fixed inset-0 z-50 bg-white flex flex-col"
            : "hidden";
    }
    return "flex flex-col w-full md:w-1/3 lg:w-1/4 xl:w-1/3 border-r border-gray-200";
};
    // const getChatWindowClasses = () => {
    //     if (isMobileView) {
    //         return showChatWindow
    //             ? "fixed inset-0 z-50 bg-white flex flex-col"
    //             : "hidden";
    //     }
    //     return "flex flex-col flex-1 w-full md:w-2/3 lg:w-3/4 xl:w-2/3";
    // };
const getChatWindowClasses = () => {
    if (isMobileView) {
        // On mobile, only show when chat window is active
        return showChatWindow 
            ? "fixed inset-0 z-50 bg-white flex flex-col"
            : "hidden";
    }
    // On desktop, always show if activeChat exists
    return activeChat 
        ? "flex flex-col flex-1 w-full md:w-2/3 lg:w-3/4 xl:w-2/3"
        : "hidden";
};
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="h-screen">
                {/* Mobile Header for Chat List */}
                {isMobileView && showChatList && (
                    <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            Messages
                        </h1>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                            <FiUserPlus className="text-xl text-gray-600" />
                        </button>
                    </div>
                )}

                {/* Mobile Header for Chat Window */}
                {isMobileView && showChatWindow && (
                    <div className="sticky top-0 z-50 flex items-center p-3 bg-white border-b border-gray-200 shadow-sm">

                        <button
                            onClick={handleBackToChats}
                            className="p-2 mr-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <BsArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-3 flex-1">
                            <div className="relative">
                                <img
                                    src={activeChat.profilePic}
                                    alt={activeChat.fullName}
                                    className="w-10 h-10 rounded-xl"
                                />
                                {activeChat.online && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-gray-800 text-sm truncate">{activeChat.fullName}</h2>
                                <p className="text-xs text-green-500 flex items-center">
                                    <BsDot className="text-lg" />
                                    Active now
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                <FiVideo className="text-lg text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                <FiMoreVertical className="text-lg text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Desktop Layout Container */}
                <div className={`h-full ${isMobileView ? '' : 'flex'}`}>
                    {/* Chat List - Sidebar */}
                    <div className={getChatListClasses()}>
                        {/* Search Bar - Only in chat list view */}
                        {(!isMobileView || showChatList) && (
                            <div className="p-4 border-b border-gray-100 bg-white">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search messages..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Chat List Items */}
                        <div className="flex-1 overflow-y-auto bg-white">
                            {usersData?.map(chat => (
                                <div
                                    key={chat._id}
                                    onClick={() => handleChatSelect(chat)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${activeChat?._id === chat?._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* Avatar with Online Indicator */}
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={chat.profilePic}
                                                alt={chat.fullName}
                                                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                                            />
                                            {isUserOnline(chat._id) && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                            )}
                                        </div>

                                        {/* Chat Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-800 text-sm truncate">{chat.fullName}</h3>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">{chat.time}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-sm text-gray-600 truncate"> {getLastMessageForUser(chat._id)}</p>
                                                {chat.unread > 0 && (
                                                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] text-center">
                                                        {chat.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* User Profile - Only on desktop */}
                        {!isMobileView && (
                            <div className="p-4 border-t border-gray-100 bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <img
                                                src={value?.user?.profilePic}
                                                alt="You"
                                                className="w-10 h-10 rounded-xl"
                                            />
                                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm">{`${value?.user?.fullName} (you)`}</h4>
                                            <p className="text-xs text-gray-500">Online</p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                        <FiSettings className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Window */}
{activeChat && (

                        <div className={getChatWindowClasses()}>
                            {/* Desktop Chat Header */}
                            {!isMobileView && (
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={activeChat?.profilePic}
                                                    alt={activeChat?.fullName}
                                                    className="w-12 h-12 rounded-xl"
                                                />
                                                {isUserOnline(activeChat?._id) && (
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                                )}
                                            </div>

                                            <div>
                                                <h2 className="font-bold text-gray-800 text-lg">{activeChat?.fullName}</h2>
                                                {isUserOnline(activeChat?._id) ?
                                                    (
                                                        <p className="text-sm text-green-500 flex items-center">

                                                            <BsDot className="text-lg" />
                                                            Active now
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-blue-500 flex items-center">

                                                            <BsDot className="text-lg" />
                                                            Offline
                                                        </p>
                                                    )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200">
                                                <FiPhone className="text-xl text-gray-600 hover:text-blue-500" />
                                            </button>
                                            <button className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200">
                                                <FiVideo className="text-xl text-gray-600 hover:text-blue-500" />
                                            </button>
                                            <button className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200">
                                                <FiMoreVertical className="text-xl text-gray-600 hover:text-blue-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 p-4">
                                <div className="space-y-4 max-w-4xl mx-auto">
                                    <div className="flex items-center md:hidden  space-x-4">
                                        {/* Avatar with Online Indicator */}

                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={activeChat?.profilePic}
                                                alt={activeChat?.fullName}
                                                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                                            />
                                            {activeChat?.online && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </div>

                                        {/* Chat Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-800 text-sm truncate">{activeChat?.fullName}</h3>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">{activeChat?.time}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-sm text-gray-600 truncate"> {activeChat?.username}</p>
                                                {activeChat?.unread > 0 && (
                                                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] text-center">
                                                        {activeChat?.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button className='cursor-pointer md:hidden' onClick={() => handleBackToChats()}><IoIosArrowRoundBack size={28} /></button>
                                    {formattedMessages?.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} items-end`}
                                        >
                                            {msg.sender === 'them' && (
                                                <div className="flex-shrink-0 mr-2">
                                                    <img
                                                        src={activeChat.profilePic}
                                                        alt={activeChat.fullName}
                                                        className="w-8 h-8 rounded-lg"
                                                    />
                                                </div>
                                            )}

                                            <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${msg.sender === 'me' ? 'order-2' : 'order-1'}`}>
                                                <div
                                                    className={`rounded-2xl px-4 py-3 ${msg.sender === 'me'
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                                                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                                        }`}
                                                >
                                                    <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                                </div>
                                                <div className={`flex items-center space-x-2 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-xs text-gray-500">{msg.time}</span>
                                                    {msg.sender === 'me' && (
                                                        <span className="text-blue-500">
                                                            {msg.status === 'read' ? (
                                                                <BsCheck2All className="text-blue-500 text-sm" />
                                                            ) : msg.status === 'delivered' ? (
                                                                <BsCheck2All className="text-gray-400 text-sm" />
                                                            ) : (
                                                                <FiCheck className="text-gray-400 text-sm" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {msg.sender === 'me' && (
                                                <div className="flex-shrink-0 ml-2">
                                                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                        <span className="text-white text-[7px] font-bold">{value?.user?.fullName?.charAt(0)?.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className="border-t border-gray-100 bg-white p-4">
                                <div className="flex items-center space-x-2 md:space-x-3">
                                    {/* Attachment Button */}
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0">
                                        <MdAttachFile className="text-xl text-gray-600" />
                                    </button>

                                    {/* Emoji Button */}
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0">
                                        <MdEmojiEmotions className="text-xl text-gray-600" />
                                    </button>

                                    {/* Image Button */}
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0 md:hidden">
                                        <HiOutlinePhotograph className="text-xl text-gray-600" />
                                    </button>

                                    {/* Message Input */}
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={inputRef}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type your message..."
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-sm md:text-base min-h-[48px] max-h-[120px]"
                                            rows="1"
                                        />
                                    </div>

                                    {/* Send/Mic Button */}
                                    <button
                                        onClick={message.trim() ? sendMessage : () => { }}
                                        className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${message.trim()
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        {message.trim() ? (
                                            <IoMdSend className="text-white text-xl" />
                                        ) : (
                                            <FiMic className="text-gray-600 text-xl" />
                                        )}
                                    </button>
                                </div>

                                {/* Quick Actions - Desktop only */}
                                {!isMobileView && (
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center space-x-4">
                                            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                                                <FiImage className="text-lg" />
                                                <span>Photo</span>
                                            </button>
                                            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                                                <FiPaperclip className="text-lg" />
                                                <span>File</span>
                                            </button>
                                            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                                                <FaRegCircle className="text-lg" />
                                                <span>Record</span>
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-600 hover:text-blue-500 transition-colors">
                                            Press Enter to send • Shift + Enter for new line
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mobile Empty State */}
                    {isMobileView && !showChatList && !showChatWindow && (
                        <div className="flex items-center justify-center h-full bg-white">
                            <div className="text-center p-8">
                                <FiMessageSquare className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Chat Selected</h3>
                                <p className="text-gray-500">Select a chat from the list to start messaging</p>
                                <button
                                    onClick={() => setShowChatList(true)}
                                    className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium"
                                >
                                    Browse Chats
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatUI;


//fhdsihfhdsfhdshfihd

// vndknvn