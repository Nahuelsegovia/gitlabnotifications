import { BaseNotificationInterface } from "./BaseNotificationInterface";
import { logInfo } from "../utils/logger";
import axios from "axios";

export class DiscordNotificationService implements BaseNotificationInterface{
    private discordWebHookUrl:string;
    constructor(discordWebHookUrl:string){
        this.discordWebHookUrl = discordWebHookUrl;
    }
    send(message:string):void{
        const data = {
            content: message,
        };

        axios.post(this.discordWebHookUrl, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(() => {
            logInfo("Success", `NOTIFICATION HAS BEEN SENT SUCCESSFULLY TO DISCORD: ${message}`)
        })
        .catch((error) => {
            logInfo("Error", `NOTIFICATION HAS NOT BEEN SENT TO DISCORD: ${error}`)
        });

    }

}