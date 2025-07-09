import { createAction } from '@reduxjs/toolkit'

import {
    CLEAR_IMAGES_BODY,
    CLEAR_IMAGES_BY_TIME_BODY,
    SEND_IMAGES_BODY,
    SEND_IMAGES_BY_TIME_BODY,
} from '~/redux/types/request'

export const sendImageReqBody = createAction(SEND_IMAGES_BODY)
export const sendImageByTimeReqBody = createAction(SEND_IMAGES_BY_TIME_BODY)
export const clearImageReqBody = createAction(CLEAR_IMAGES_BODY)
export const clearImageByTimeReqBody = createAction(CLEAR_IMAGES_BY_TIME_BODY)
