import { BaseNotificationInterface } from "./BaseNotificationInterface";
import { logInfo } from "../utils/logger";
import axios from "axios";

export class SlackNotification implements BaseNotificationInterface{
    private slackWebHookUrl:string = 'https://hooks.slack.com/services/'
    private slackWorksPaceId:string;
    private slackChannelId:string;
    private slackTokenAuthorization:string;

    constructor(slackWorksPaceId:string, slackChannelId:string, slackTokenAuthorization:string){
        this.slackWorksPaceId = slackWorksPaceId;
        this.slackChannelId = slackChannelId;
        this.slackTokenAuthorization = slackTokenAuthorization;
    }

    send(message:string):void{
        const data = {
            text: message,
        };

        axios.post(`${this.slackWebHookUrl + this.slackWorksPaceId + "/" + this.slackChannelId + "/" + this.slackTokenAuthorization}`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(() => {
            logInfo("Success", `NOTIFICATION HAS BEEN SENT SUCCESSFULLY TO SLACK: ${message}`)
        })
        .catch((error) => {
            logInfo("Error", `NOTIFICATION HAS NOT BEEN SENT TO SLACK: ${error}`)
        });

    }

}