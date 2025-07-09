import { createAction } from '@reduxjs/toolkit'

import { IS_FETCHING_API, TOGGLE_MODAL } from '~/redux/types/global'

export const fetchingAPI = createAction(IS_FETCHING_API)
export const toggleModal = createAction(TOGGLE_MODAL)
