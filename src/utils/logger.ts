import { ERROR_MESSAGE_COLOR, SUCCESS_MESSAGE_COLOR } from "./messagesConfiguration";

export const logInfo = (error_or_success:string, message:string,):void => {
    if(error_or_success.toLowerCase() !== "error"){
        console.log(SUCCESS_MESSAGE_COLOR,  `
        #################################
        ${message}
        #################################
        \n
    `)
    } else {
        console.log(ERROR_MESSAGE_COLOR, `
        #################################
        ${message}
        #################################
        \n
    `)
    }
}