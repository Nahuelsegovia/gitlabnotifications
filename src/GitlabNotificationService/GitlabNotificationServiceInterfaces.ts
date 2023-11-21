interface BaseMessageInterface{
    message_type: string,
    user:{
        username:string;
    };

    repository:{
        project_name:string;
        url:string;
        namespace:string;
    },

}

export interface PushMessageInterface extends BaseMessageInterface{
    total_commits_count:number;
    branch:string
}

export interface IssueMessageInterface extends BaseMessageInterface{
   issue:{
        title:string;
        description:string;
        state:string;
        action:string;
        severity:string;
        url:string;
        created_at:string;
        labels:string[]
   }

   assignee:string;
   assignees: { username: string }[];
}

export interface CommentMessageInterface extends BaseMessageInterface{
    comment_text:string;
    comment_type:string;
    comment_url:string;
}

export interface TagMessageInterface extends BaseMessageInterface{
    tag_name:string;
}

export interface TaskIssueMessageInterface extends BaseMessageInterface{
    task_name:string;
    status:string;
    created_at:string;
}

export interface MergeRequestInterface extends BaseMessageInterface{
    source_branch:string;
    target_branch:string;
    source_branch_url:string;
    target_branch_url:string;
    merge_request_url:string;
    last_commit:{
        url:string;
        author:string;
        title:string;
        message:string;
    }
}

export interface customMessageInterface {
    pushMessage: (eventData: any) => string;
    issueMessage: (eventData: any) => string;
    commentMessage: (eventData: any) => string;
    tagMessage: (eventData: any) => string;
    mergeRequestMessage: (eventData: any) => string;
    issueTaskMessage: (eventData: any) => string;
}