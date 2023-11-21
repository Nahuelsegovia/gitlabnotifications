export interface SendNotificationsToInterface {
    configuration: {
      telegram?: {
        token: string;
        chat_id: string;
      };
      slack?: {
        workspace_id: string;
        channel_id: string;
        token: string;
      };
      discord?:{
        web_hook_url: string;
      }
    }[];
  }