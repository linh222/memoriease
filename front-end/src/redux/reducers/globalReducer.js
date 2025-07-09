import { createReducer } from '@reduxjs/toolkit'

import { IS_FETCHING_API, TOGGLE_MODAL } from '~/redux/types/global'

const initialState = {
    isFetchingAPI: false,
    isOpenModal: false,
}

const globalReducer = createReducer(initialState, (builder) => {
    builder.addCase(IS_FETCHING_API, (state, action) => {
        state.isFetchingAPI = action.payload
    })
    builder.addCase(TOGGLE_MODAL, (state, action) => {
        state.isOpenModal = action.payload
    })
})

export default globalReducer
