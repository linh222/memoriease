import { cloneDeep, groupBy, isEmpty } from 'lodash'
import { getHours } from 'date-fns'

import {
    fetchCurentEvent,
    fetchImageByTime,
    fetchImagesFrom,
    fetchVisualSimilarity,
    removeImage,
    saveImage,
    searchConversation,
} from '~/apis'
import {
    clearConversation,
    clearSavedImage,
    getImages,
    getImagesByMetadata,
    getImagesByTime,
    getImagesByTimeUsingLink,
    getSimilarImages,
    removeMetadataImage,
    removeSavedImage,
    saveImageAction,
    saveMetadataImage,
    searchConversationAction,
} from '~/redux/actions/imageAction'
import { handleSendImageByTimeReqBody, handleSendImageReqBody } from './requestLogic'
import { handleFetchingAPI } from './globalLogic'

const convertToImagesByTime = (imagesByTime) => {
    const groupByHour = groupBy(imagesByTime, (item) => [getHours(new Date(item.local_time)), 'h'].join(''))
    const newImagesByTime = []

    if (!isEmpty(groupByHour)) {
        for (const hour in groupByHour) {
            newImagesByTime.push({ time: hour, images: groupByHour[hour] })
        }
    }

    return newImagesByTime
}

const handleClearImages = () => (dispatch) => dispatch(getImages([]))

const handleGetImagesByTimeUsingLink = (images, originalImage, isOpenPopup, isLoading) => (dispatch) => {
    const cloneImagesByTimeUsingLink = cloneDeep(images)
    if (isEmpty(cloneImagesByTimeUsingLink)) {
        dispatch(
            getImagesByTimeUsingLink({
                originalImage,
                isLoading,
                isOpenPopup,
                images: [],
            }),
        )
    } else {
        const newImagesByTimeUsingLink = convertToImagesByTime(cloneImagesByTimeUsingLink)
        dispatch(
            getImagesByTimeUsingLink({
                originalImage,
                isOpenPopup,
                images: newImagesByTimeUsingLink,
                isLoading,
            }),
        )
    }
}

const handleGetSimilarImages = (images, isOpenPopup) => (dispatch) =>
    dispatch(getSimilarImages({ images, isOpenPopup }))

const handleSaveImage = (image) => (dispatch) => dispatch(saveImageAction(image))

const handleClearSavedImage = () => (dispatch) => dispatch(clearSavedImage([]))

const handleRemoveSavedImage = (imageId) => (dispatch) => dispatch(removeSavedImage(imageId))

const handleClearConversation = () => (dispatch) =>
    dispatch(clearConversation({ previousChat: [], images: [], textualAnswer: [] }))

const handleGetImages = (apiKey, body) => async (dispatch) => {
    const res = await fetchCurentEvent(apiKey, body)

    if (res) {
        dispatch(handleSendImageReqBody(body))
        dispatch(getImages(res))
    }
    dispatch(handleFetchingAPI(false))
}

const handleGetImagesByTime = (body, isUsingLink) => async (dispatch) => {
    if (isUsingLink) {
        dispatch(handleGetImagesByTimeUsingLink([], '', true, true))
        const { originalImage, day_month_year } = body
        const res = await fetchImageByTime({ day_month_year, hour: '', time_period: '' })
        if (res) {
            dispatch(handleGetImagesByTimeUsingLink(res, originalImage, true, false))
        } else {
            dispatch(handleGetImagesByTimeUsingLink([], '', true, false))
        }
    } else {
        const res = await fetchImageByTime(body)
        if (res) {
            dispatch(handleSendImageByTimeReqBody(body))

            const cloneImagesByTime = cloneDeep(res)
            const newImagesByTime = convertToImagesByTime(cloneImagesByTime)
            dispatch(getImagesByTime(newImagesByTime))
        }
        dispatch(handleFetchingAPI(false))
    }
}

const handleGetImagesByMetadata = (user, year, month, date) => async (dispatch) => {
    const res = await fetchImagesFrom(`${user}/${year}${month}/${date}`)
    if (res) {
        const cloneImagesByMetadata = cloneDeep(res)
        const newImagesByMetadata = convertToImagesByTime(cloneImagesByMetadata)
        dispatch(getImagesByMetadata(newImagesByMetadata))
    }
    dispatch(handleFetchingAPI(false))
}

const handleSaveMetadataImage = (image) => async (dispatch) => {
    const { image_link } = image
    const fileName = image_link.split('http://localhost:4000/static/')[1]

    await saveImage(fileName)
    dispatch(saveMetadataImage(image))
}

const handleRemoveMetadataImage = (image) => async (dispatch) => {
    const { image_link } = image
    const fileName = image_link.split('http://localhost:4000/static/')[1]

    await removeImage(fileName)
    dispatch(removeMetadataImage(image))
}

const handleSearchConversation = (query) => async (dispatch, getState) => {
    const { previousChat, textualAnswer, images } = getState().imageReducer.conversation
    const clonePreviousChat = cloneDeep(previousChat)
    const cloneTextualAnswer = cloneDeep(textualAnswer)
    const hasSubmitText = query.toLowerCase().startsWith('submit:')
    const reqQuery = hasSubmitText ? query.slice('submit:'.length, query.length).trim() : query
    const textualAnswers = []

    dispatch(handleFetchingAPI(true))

    clonePreviousChat.unshift(reqQuery)
    if (hasSubmitText) {
        textualAnswers.push('Your answer has been submitted')
    }
    cloneTextualAnswer.unshift(textualAnswers)

    dispatch(
        searchConversationAction({
            previousChat: cloneDeep(clonePreviousChat),
            images,
            textualAnswer: cloneDeep(cloneTextualAnswer),
        }),
    )

    const res = await searchConversation(reqQuery, previousChat, hasSubmitText)

    if (!isEmpty(res)) {
        cloneTextualAnswer.shift()
        textualAnswers.push(res.textual_answer)
        cloneTextualAnswer.unshift(textualAnswers)

        dispatch(
            searchConversationAction({
                previousChat: clonePreviousChat,
                images: res.results,
                textualAnswer: cloneTextualAnswer,
            }),
        )
    }

    dispatch(handleFetchingAPI(false))
}

const handleVisualSimilarity = (imageIds, query) => async (dispatch) => {
    dispatch(handleFetchingAPI(true))
    const res = await fetchVisualSimilarity(imageIds, query)

    if (res) {
        dispatch(getImages(res))
    }
    dispatch(handleFetchingAPI(false))
}

export {
    handleClearImages,
    handleGetImagesByTimeUsingLink,
    handleGetSimilarImages,
    handleSaveImage,
    handleClearSavedImage,
    handleRemoveSavedImage,
    handleClearConversation,
    handleGetImages,
    handleGetImagesByTime,
    handleGetImagesByMetadata,
    handleSaveMetadataImage,
    handleRemoveMetadataImage,
    handleSearchConversation,
    handleVisualSimilarity,
}
