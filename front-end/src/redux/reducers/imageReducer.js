import { createReducer } from '@reduxjs/toolkit'
import { cloneDeep, isArray, isEmpty } from 'lodash'
import { getHours } from 'date-fns'

import {
    GET_IMAGES,
    GET_IMAGES_BY_TIME,
    GET_IMAGES_BY_TIME_USING_LINK,
    SAVE_IMAGE,
    REMOVE_SAVED_IMAGE,
    GET_SIMILAR_IMAGES,
    GET_IMAGES_BY_METADATA,
    CLEAR_SAVED_IMAGES,
    REMOVE_METADATA_IMAGE,
    SEARCH_CONVERSATION,
    CLEAR_CONVERSATION,
} from '~/redux/types/image'

const initialState = {
    listImages: [],
    listImagesByTime: [],
    listImagesByMetadata: [],
    imagesByTimeUsingLink: {
        isLoading: false,
        isOpenPopup: false,
        originalImage: '',
        images: [],
    },
    savedImage: [],
    similarImages: {
        isOpenPopup: false,
        images: [],
    },
    conversation: {
        previousChat: [],
        images: [],
        textualAnswer: [],
    },
}

const imageReducer = createReducer(initialState, (builder) => {
    builder.addCase(GET_IMAGES, (state, action) => {
        state.listImages = action.payload
    })
    builder.addCase(GET_IMAGES_BY_TIME, (state, action) => {
        state.listImagesByTime = action.payload
    })
    builder.addCase(GET_IMAGES_BY_METADATA, (state, action) => {
        state.listImagesByMetadata = action.payload
    })
    builder.addCase(GET_IMAGES_BY_TIME_USING_LINK, (state, action) => {
        state.imagesByTimeUsingLink = action.payload
    })
    builder.addCase(SAVE_IMAGE, (state, action) => {
        const cloneSavedImage = cloneDeep(state.savedImage)

        if (isArray(action.payload)) {
            cloneSavedImage.push(...cloneDeep(action.payload))
        } else {
            cloneSavedImage.push(action.payload)
        }

        state.savedImage = cloneSavedImage
    })
    builder.addCase(CLEAR_SAVED_IMAGES, (state, action) => {
        state.savedImage = action.payload
    })
    builder.addCase(REMOVE_SAVED_IMAGE, (state, action) => {
        const cloneRemoveSavedImage = cloneDeep(state.savedImage)
        const index = cloneRemoveSavedImage.findIndex((image) => image.ImageID === action.payload)
        cloneRemoveSavedImage.splice(index, 1)

        state.savedImage = cloneRemoveSavedImage
    })
    builder.addCase(REMOVE_METADATA_IMAGE, (state, action) => {
        const cloneListImagesByMetadata = cloneDeep(state.listImagesByMetadata)
        const hour = `${getHours(new Date(action.payload.local_time))}h`
        const metadataIndex = cloneListImagesByMetadata.findIndex((item) => item.time === hour)
        const removeIndex = cloneListImagesByMetadata[metadataIndex].images.findIndex(
            (item) => item.ImageID === action.payload.ImageID,
        )

        cloneListImagesByMetadata[metadataIndex].images.splice(removeIndex, 1)

        if (isEmpty(cloneListImagesByMetadata[metadataIndex].images)) {
            cloneListImagesByMetadata.splice(metadataIndex, 1)
        }

        state.listImagesByMetadata = cloneListImagesByMetadata
    })
    builder.addCase(GET_SIMILAR_IMAGES, (state, action) => {
        state.similarImages = action.payload
    })
    builder.addCase(SEARCH_CONVERSATION, (state, action) => {
        state.conversation = action.payload
    })
    builder.addCase(CLEAR_CONVERSATION, (state, action) => {
        state.conversation = action.payload
    })
})

export default imageReducer
