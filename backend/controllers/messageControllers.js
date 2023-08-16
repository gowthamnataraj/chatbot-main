const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const asyncHandler  = require("express-async-handler");


const sendMessage = asyncHandler(async (request, response) => {
    const { content, chatId} = request.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return response.sendStatus(400);
    }

    var newMessage = {
        sender: request.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path:"chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(request.body.chatId, {
            latestMessage:message,
        });

        response.json(message);
    } catch (error) {
        response.status(400);
        throw new Error(error.message);
    }
});

const allMessages = asyncHandler(async(request,response) => {
    try {
        const messages = await Message.find({chat:request.params.chatId}).populate("sender", "name pic email").populate("chat");

        response.json(messages);
    } catch (error) {
        response.status(400);
        throw new Error(error.message);
    }
});

module.exports = { sendMessage, allMessages };