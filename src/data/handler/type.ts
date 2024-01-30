import TelegramBot from "node-telegram-bot-api";
import { IUser } from "../repository/database/models/user";
import { Document } from "mongoose";

export type SessionType = {
    query: TelegramBot.CallbackQuery;
    user: (Document<unknown, {}, IUser> & IUser & Required<{ _id: string; }>);
}
export type SessionMessage = {
    msg: TelegramBot.Message;
    user: (Document<unknown, {}, IUser> & IUser & Required<{ _id: string; }>);
}