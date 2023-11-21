import { SendNotificationsToInterface } from "./NotificationServiceInterfaces";
import { TelegramNotification } from "./TelegramNotification";
import { SlackNotification } from "./SlackNotification";

export class NotificationService{
    public sendNotification(sendNotificationsTo:SendNotificationsToInterface|null, message:string):void{
        if(sendNotificationsTo){
            sendNotificationsTo.configuration.map((config, index) => {
                if(config.telegram){
                    const telegramNotificationService = new TelegramNotification(config.telegram.token, config.telegram.chat_id);
                    telegramNotificationService.send(message)
                }
                
                if(config.slack){
                    const slackNotificationService = new SlackNotification(config.slack.workspace_id, config.slack.channel_id, config.slack.token);
                    slackNotificationService.send(message)
                }
            })
        }
    }
}