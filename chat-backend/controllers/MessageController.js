import User from '../models/User.js';
import Message from '../models/Message.js';
import cloudinary from '../utils/cloudinaryUtil.js'; 
import { io, userSocketMap } from '../server.js'; 

export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id; 
        const users = await User.find({ _id: { $ne: userId } }).select('-password'); 

        const unseenMessages = await Message.aggregate([
            {
                $match: {
                    receiverId: userId,
                    seen: false
                }
            },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 }
                }
            }
        ]);
        const unseenCountMap = unseenMessages.reduce((acc, msg) => {
            acc[msg._id.toString()] = msg.count;
            return acc;
        }, {});

        res.status(200).json({ success: true, users, unseenCount: unseenCountMap });
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params; // Get the userId from request parameters
        const currentUserId = req.user._id; // Assuming user ID is stored in req.user by auth middleware

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        }).sort({ timestamp: 1 }); 
        await Message.updateMany(
            {
                senderId: userId,
                receiverId: currentUserId,
                seen: false
            },
            { $set: { seen: true } }
        );

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const markMessagesAsSeen = async (req, res) => {    
    try {        
        const { id } = req.params; 

        if (!id) {
            return res.status(400).json({ success: false, message: "Message ID is required" });
        }

        await Message.findByIdAndUpdate(id, { seen: true });        

        res.status(200).json({ success: true, message: "Messages marked as seen" });
    } catch (error) {
        console.error("Error marking messages as seen:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { image, content } = req.body;
        const receiverId = req.params.id; 
        const senderId = req.user._id; 

        let imageUrl;
        if(image) {
            const uploadResult = await cloudinary.uploader.upload(image, {
                folder: 'chat_images',
                resource_type: 'image'
            });
            imageUrl = uploadResult.secure_url; // Get the secure URL of the uploaded image
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            content,
            image: imageUrl
        });

        await newMessage.save();

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}