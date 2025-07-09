import { createReducer } from '@reduxjs/toolkit'

import {
    SEND_IMAGES_BODY,
    SEND_IMAGES_BY_TIME_BODY,
    CLEAR_IMAGES_BODY,
    CLEAR_IMAGES_BY_TIME_BODY,
} from '~/redux/types/request'

const initialState = {
    imagesReqBody: {},
    imagesByTimeReqBody: {},
}

const requestReducer = createReducer(initialState, (builder) => {
    builder.addCase(SEND_IMAGES_BODY, (state, action) => {
        state.imagesReqBody = action.payload
    })
    builder.addCase(SEND_IMAGES_BY_TIME_BODY, (state, action) => {
        state.imagesByTimeReqBody = action.payload
    })
    builder.addCase(CLEAR_IMAGES_BODY, (state) => {
        state.imagesReqBody = {}
    })
    builder.addCase(CLEAR_IMAGES_BY_TIME_BODY, (state) => {
        state.imagesByTimeReqBody = {}
    })
})

export default requestReducer
