import express from 'express';
import { 
    PushMessageInterface, 
    IssueMessageInterface, 
    CommentMessageInterface, 
    TagMessageInterface, 
    MergeRequestInterface, 
    customMessageInterface, 
    TaskIssueMessageInterface } 
from './GitlabNotificationServiceInterfaces';
import { SendNotificationsToInterface } from '../NotificationService/NotificationServiceInterfaces';
import { NotificationService } from '../NotificationService/NotificationService';

export class GitlabNotificationService {
    private gitlabWebHookUrls:string[];
    private enableCustomMessage:boolean = false;
    private customMessages:customMessageInterface|null = null;
    private sendMessagesTo:SendNotificationsToInterface;
    private notificationsService:NotificationService;
    private expressApplication:express.Application;
    private routesMiddleware:any;

    constructor(
            gitlabWebHookUrl: string[], 
            enableCustomMessage:boolean = false, 
            customMessages:customMessageInterface|null = null, 
            sendMessagesTo:SendNotificationsToInterface, 
            expressApplication:express.Application,
            routesMiddleware?:any,
        )
        {
            this.constructorValidation(gitlabWebHookUrl,enableCustomMessage,customMessages,sendMessagesTo)
            this.notificationsService = new NotificationService()
            this.gitlabWebHookUrls = gitlabWebHookUrl;
            this.enableCustomMessage = enableCustomMessage;
            this.customMessages = customMessages;
            this.sendMessagesTo = sendMessagesTo;
            this.expressApplication = expressApplication;
            this.routesMiddleware = routesMiddleware;
        }

    private constructorValidation(gitlabWebHookUrl: string[], enableCustomMessage:boolean = false, customMessages:customMessageInterface|null = null, sendMessagesTo:SendNotificationsToInterface){
        if (!Array.isArray(gitlabWebHookUrl) || gitlabWebHookUrl.length === 0) {
            throw new Error("Gitlab WebHook URLs must be a non-empty array");
        }
        if(typeof enableCustomMessage !== "boolean") throw new Error("enableCustomMessage must be a boolean type");
        if(typeof customMessages !== "object") throw new Error("customMessages must be an object that contains custom messages functions");
        if(typeof sendMessagesTo !== "object") throw new Error("sendMessagesTo must be an object that contains notifications targets and its configurations");
    }

    private getAssigneesUsernames(assignees: { username: string }[]): string {
        if(assignees === null || assignees === undefined) return 'Unassigned';
        const usernames = assignees.map(assignee => assignee.username);
        const usernamesString = usernames.join(', ');
        return usernamesString;
    }

    private sendPushMessage(eventData:any, sendCustomMessage:string|null): void {
        if(eventData === null) return;
        const pushMessage:PushMessageInterface = {
            message_type: "push",
            user: {
                username: eventData.user_username
            },
            
            repository:{
                project_name: eventData.project.name,
                url: eventData.project.http_url,
                namespace: eventData.project.namespace
            },

            total_commits_count: eventData.total_commits_count,
            branch: eventData.ref
        };

        if(this.enableCustomMessage){
            this.handleCustomMessageEvent(sendCustomMessage)

        } else {
            const messageForNotification = `
                👨‍💻 User: ${pushMessage.user.username} has made a push
                Branch: ${pushMessage.branch}
                Total commits: ${pushMessage.total_commits_count}
                Repository url: 
                ${pushMessage.repository.url}
            `;
            
            this.notificationsService.sendNotification(this.sendMessagesTo, messageForNotification); 
        }
    }
    
    private sendIssueMessage(eventData:any, sendCustomMessage:string|null): void {
        if(eventData === null) return;
        const issueMessage:IssueMessageInterface = {
            message_type: "issue",

            user: {
                username: eventData.user.username
            },
            
            repository:{
                project_name: eventData.project.name,
                url: eventData.project.url,
                namespace: eventData.project.namespace
            },

            issue:{
                title: eventData.object_attributes.title,
                description: eventData.object_attributes.description,
                state: eventData.object_attributes.state,
                action: eventData.object_attributes.action,
                severity: eventData.object_attributes.severity,
                url: eventData.object_attributes.url,
                created_at: eventData.object_attributes.created_at,
                labels: eventData.object_attributes.labels.map((label:any) => {
                    return label.title;
                })
           },
           assignee: eventData.assignee,
           assignees: eventData.assignees
        }

        if(this.enableCustomMessage){
            this.handleCustomMessageEvent(sendCustomMessage)
        } else {
            const messageForNotification = `
            👨‍💻 User: ${issueMessage.user.username} has ${issueMessage.issue.action} ${issueMessage.issue.title}
            Severity: ${issueMessage.issue.severity}
            Url: ${issueMessage.issue.url}
            Created: ${issueMessage.issue.created_at}
            Asignee: ${this.getAssigneesUsernames(issueMessage.assignees)}
            ${issueMessage.issue.labels ?  "Labels: " + issueMessage.issue.labels : null}
            Repository url: 
            ${issueMessage.repository.url}
            `;
            this.notificationsService.sendNotification(this.sendMessagesTo, messageForNotification)
        }
    }

    private sendCommentMessage(eventData:any, sendCustomMessage:string|null): void {
        if(eventData === null) return;
        const commentMessage: CommentMessageInterface = {
            message_type: eventData.object_kind,
            user:{
                username: eventData.user.username
            },
            repository:{
                project_name: eventData.project.name,
                url: eventData.project.http_url,
                namespace: eventData.project.namespace
            },
            comment_text: eventData.object_attributes.note,
            comment_type: eventData.object_attributes.noteable_type,
            comment_url: eventData.object_attributes.url
        }
        if(this.enableCustomMessage){
            this.handleCustomMessageEvent(sendCustomMessage)
        } else {
            const messageForNotification = `
            👨‍💻 User: ${commentMessage.user.username} has made a comment in ${commentMessage.comment_type}
            Comment: ${commentMessage.comment_text}
            Comment url: ${commentMessage.comment_url}
            Repository url: 
            ${commentMessage.repository.url}
            `;
            this.notificationsService.sendNotification(this.sendMessagesTo, messageForNotification);
        }
        
    }

    private sendTagMessage(eventData:any, sendCustomMessage:string|null): void {
        if(eventData === null) return;
        const tagMessage: TagMessageInterface = {
            message_type: eventData.object_kind,
            user:{
                username: eventData.user_username
            },
            repository:{
                project_name: eventData.project.name,
                url: eventData.project.http_url,
                namespace: eventData.project.namespace
            },
            tag_name: eventData.ref
        }
        if(this.enableCustomMessage){
            this.handleCustomMessageEvent(sendCustomMessage)
        } else {
            const messageForNotification = `
            👨‍💻 User: ${tagMessage.user.username} has made a ${tagMessage.message_type}
            Tag name: ${tagMessage.tag_name}
            Repository url: 
            ${tagMessage.repository.url}
            `;

            this.notificationsService.sendNotification(this.sendMessagesTo, messageForNotification);
        }
        
    }

    private sendMergeRequestMessage(eventData:any, sendCustomMessage:string|null): void {
        if (eventData === null) return;
        const mergeRequestMessage:MergeRequestInterface = {
            message_type: eventData.object_kind,
            user: {
                username: eventData.user.username
            },
            source_branch: eventData.object_attributes.source_branch,
            target_branch: eventData.object_attributes.target_branch,
            source_branch_url: eventData.object_attributes.source.web_url,
            target_branch_url: eventData.object_attributes.target.web_url,
            merge_request_url: eventData.object_attributes.url,
            last_commit: {
                url: eventData.object_attributes.last_commit.url,
                author: eventData.object_attributes.last_commit.author.name,
                title: eventData.object_attributes.last_commit.title,
                message: eventData.object_attributes.last_commit.message
            },
            
            repository:{
                project_name: eventData.project.name,
                url: eventData.project.http_url,
                namespace: eventData.project.namespace
            },
        };

        if(this.enableCustomMessage){
            this.handleCustomMessageEvent(sendCustomMessage)
        } else {
            const messageForNotification = `
                👨‍💻 User: ${mergeRequestMessage.user.username} has ${eventData.object_attributes.action} Merge Request
                Source Branch: ${mergeRequestMessage.source_branch}
                Target Branch: ${mergeRequestMessage.target_branch}
                Source Branch URL: ${mergeRequestMessage.source_branch_url}
                Target Branch URL: ${mergeRequestMessage.target_branch_url}
                Merge Request URL: ${mergeRequestMessage.merge_request_url}
                Last Commit URL: ${mergeRequestMessage.last_commit.url}
                Last Commit Author: ${mergeRequestMessage.last_commit.author}
                Last Commit Title: ${mergeRequestMessage.last_commit.title}
                Last Commit Message: ${mergeRequestMessage.last_commit.message}
            `;
    
            this.notificationsService.sendNotification(this.sendMessagesTo, messageForNotification);
        }
    }

    private sendTaskIssueMessage(eventData:any, sendCustomMessage:string|null): void {
        if(eventData === null) return;
        const taskIssueMessage: TaskIssueMessageInterface = {
            message_type: eventData.object_kind,
            user:{
                username: eventData.user.username
            },
            repository:{
                project_name: eventData.project.name,
                url: eventData.project.git_http_url,
                namespace: eventData.project.namespace
            },
            task_name: eventData.object_attributes.title,
            status: eventData.object_attributes.action,
            created_at: eventData.object_attributes.created_at
        }
        if(this.enableCustomMessage){
            this.handleCustomMessageEvent(sendCustomMessage)
        } else {
            const messageForNotification = `
            👨‍💻 User: ${taskIssueMessage.user.username} has ${taskIssueMessage.status} task
            Task name: ${taskIssueMessage.task_name}
            Created at: ${taskIssueMessage.created_at}
            Repository url: 
            ${taskIssueMessage.repository.url}
            `;

            this.notificationsService.sendNotification(this.sendMessagesTo, messageForNotification);
        }
        
    }

    private handleCustomMessageEvent(message:string|null){
        if(message){
            this.notificationsService.sendNotification(this.sendMessagesTo, message);
        } else {
            return 'Message text is required'
        }
    }

    connection():void {
        console.log("Notifications service is running :)")
        this.gitlabWebHookUrls.forEach(route => {
            this.expressApplication.post(route, (req, res, next) => {
                const eventData = req.body;
                if(this.routesMiddleware() === true){
                    next()
                } 
                else{
                    res.status(401).json({
                        error: "You don't have permissions"
                    })
                    throw new Error("You don't have permissions")
                }
                    
                switch (eventData.object_kind) {
                    case "push":
                        this.sendPushMessage(eventData, this.customMessages? this.customMessages.pushMessage(eventData): null);
                        break;
                    case "issue":
                        this.sendIssueMessage(eventData, this.customMessages? this.customMessages.issueMessage(eventData): null);
                        break;
                    case "note":
                        this.sendCommentMessage(eventData, this.customMessages? this.customMessages.commentMessage(eventData): null);
                        break;
                    case "tag_push":
                        this.sendTagMessage(eventData, this.customMessages? this.customMessages.tagMessage(eventData): null);
                        break;
                    case "merge_request":
                        this.sendMergeRequestMessage(eventData, this.customMessages? this.customMessages.mergeRequestMessage(eventData) : null);
                        break;
                    case "work_item":
                        this.sendTaskIssueMessage(eventData, this.customMessages? this.customMessages.issueTaskMessage(eventData): null)
                    default:
                        break;
                }
                res.sendStatus(200);
            });
        });
    }
}