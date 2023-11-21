import { BaseNotificationInterface } from "./BaseNotificationInterface";
import { logInfo } from "../utils/logger";
import axios from "axios";

export class TelegramNotification implements BaseNotificationInterface{
    private telegramBotToken:string;
    private telegramChatId:string;
    private telegramApi:string = 'https://api.telegram.org/'

    constructor(telegramBotToken:string, telegramChatId:string){
        this.telegramBotToken = telegramBotToken;
        this.telegramChatId = telegramChatId
    }

    send(message:string):void{
        axios.post(`${this.telegramApi}bot${this.telegramBotToken}/sendMessage`, {
            chat_id: this.telegramChatId,
            text: message,
        })

        .then(() => {
            logInfo("Success", `NOTIFICATION HAS BEEN SENT SUCCESSFULLY TO TELEGRAM: ${message}`)
        })
        .catch((error) => {
            logInfo("Error", `NOTIFICATION HAS NOT BEEN SENT TO TELEGRAM: ${error}`)
        });

    }

}