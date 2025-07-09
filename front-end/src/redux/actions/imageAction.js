import { createAction } from '@reduxjs/toolkit'

import {
    GET_IMAGES,
    GET_IMAGES_BY_TIME,
    GET_IMAGES_BY_TIME_USING_LINK,
    SAVE_IMAGE,
    REMOVE_SAVED_IMAGE,
    GET_SIMILAR_IMAGES,
    CLEAR_SAVED_IMAGES,
    GET_IMAGES_BY_METADATA,
    REMOVE_METADATA_IMAGE,
    SAVE_METADATA_IMAGE,
    SEARCH_CONVERSATION,
    CLEAR_CONVERSATION,
} from '~/redux/types/image'

export const getImages = createAction(GET_IMAGES)
export const getImagesByTime = createAction(GET_IMAGES_BY_TIME)
export const getImagesByTimeUsingLink = createAction(GET_IMAGES_BY_TIME_USING_LINK)
export const getImagesByMetadata = createAction(GET_IMAGES_BY_METADATA)
export const saveMetadataImage = createAction(SAVE_METADATA_IMAGE)
export const getSimilarImages = createAction(GET_SIMILAR_IMAGES)
export const saveImageAction = createAction(SAVE_IMAGE)
export const clearSavedImage = createAction(CLEAR_SAVED_IMAGES)
export const removeSavedImage = createAction(REMOVE_SAVED_IMAGE)
export const removeMetadataImage = createAction(REMOVE_METADATA_IMAGE)
export const searchConversationAction = createAction(SEARCH_CONVERSATION)
export const clearConversation = createAction(CLEAR_CONVERSATION)
