import {
    clearImageByTimeReqBody,
    clearImageReqBody,
    sendImageByTimeReqBody,
    sendImageReqBody,
} from '~/redux/actions/requestAction'

export const handleSendImageReqBody = (body) => (dispatch) => dispatch(sendImageReqBody(body))
export const handleSendImageByTimeReqBody = (body) => (dispatch) => dispatch(sendImageByTimeReqBody(body))
export const handleClearImageReqBody = (body) => (dispatch) => dispatch(clearImageReqBody(body))
export const handleClearImageByTimeReqBody = (body) => (dispatch) => dispatch(clearImageByTimeReqBody(body))
