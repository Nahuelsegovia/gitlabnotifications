# gitlabnotifications
A package to receive Gitlab notifications in Telegram, Discord or Slack


## How to install?

```bash
npm install express
npm install gitlabnotifications
```

## Basic configuration
If you need to send notifications only one platform at time, just delete its configuration lines
```javascript
const { GitlabNotifications } = require('gitlabnotifications');
const express = require('express');

const app = express()
app.use(express.json());
app.listen(3000, function () {
});


const sendNotificationsTo = {
    configuration: [
      {
        telegram: {
          token: 'your_telegram_token',
          chat_id: 'your_chat_id',
        },
      },
      {
        slack: {
          workspace_id: 'your_workspace_id',
          channel_id: 'your_slack_channel_id',
          token: 'your_slack_app_token',
        },
      },
    ],
  };

const myMiddleware = (req, res) => {
 /*Your custom middleware has to return true if everything it's okay
  and return false if isn't */
  return true;
}

const gitlabNotificationsService = new GitlabNotifications(
  ['/gitlab-webhook'], //Webhooks urls directions previously configured in Gitlab
  false, //Set in true if you want to send custom notification messages
  null, // Custom messages (if needed)
  sendNotificationsTo,
  app, //Your express instance
  myMiddleware
);


gitlabNotificationsService.connection()

```


## How to use custom notifications messages?

For more information about to get events values you can visit the official gitlab web hooks documentation
https://docs.gitlab.com/ee/user/project/integrations/webhook_events.html

You can declare an object that contains all custom message handlers like this.

```javascript

const customMessages = {
  pushMessage: (eventData) => `Custom push message: ${eventData.user_username} pushed to ${eventData.project.name}`,
  issueMessage: (eventData) => `Custom issue message: ${eventData.user.username} created an issue in ${eventData.project.name}`,
  commentMessage: (eventData) => `Custom comment message: ${eventData.user.username} commented on something`,
  tagMessage: (eventData) => `Custom tag message: A new tag ${eventData.ref} was created in ${eventData.project.name}`,
  mergeRequestMessage: (eventData) => `Custom merge request message: ${eventData.user.username} created a merge request in ${eventData.project.name}`,
  issueTaskMessage: (eventData) => `Custom task message: ${eventData.user.username} created a merge request in ${eventData.project.name}`,
};

const gitlabNotificationsService = new GitlabNotifications(
  ['/gitlab-webhook'], 
  true, //Set in true if you want to send custom notification messages
  customMessages, // Custom messages (if needed)
  sendNotificationsTo,
  app, //Your express instance
  myMiddleware
);

gitlabNotificationsService.connection()

```

Every time an event is triggered and messages are sent successfully, you will see a green color on your terminal,
When you see the color red, it is an error in the message sender's process.

![Alt Text](https://i.ibb.co/yYZH5p8/Captura-de-pantalla-de-2023-11-20-16-43-34.png)
