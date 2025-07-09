import { toast } from 'react-toastify'

import axios from './axiosConfig'
import { API_ROOT, API_SERVER, EVALUATION_ID, SESSION_ID, imageConstant } from '~/utils/constants'
import { resExceptionMessageHandler } from '~/utils/helper'
import { fakeRequest, fakeSearchConversation } from '~/utils/fakeData'

const fetchCurentEvent = async (apiKey, body) => {
    // "query" must be required
    let isMoreSearch = false
    const { query, previous_event, next_event, time_gap, semantic_name } = body

    if (previous_event || next_event) {
        isMoreSearch = true
    }

    try {
        let res = null
        if (isMoreSearch) {
            res = await axios.post(`${API_ROOT}/predict_temporal?api_key=${apiKey}`, {
                query,
                previous_event,
                next_event,
                time_gap,
                semantic_name,
            })
        } else {
            // res = await axios.post(`${API_ROOT}/predict_relevance_feedback?api_key=${apiKey}`, {
            //     query: query,
            //     semantic_name: semantic_name,
            //     image_id: image_id,
            // })
            res = await axios.post(`${API_ROOT}/predict?api_key=${apiKey}`, {
                query,
                semantic_name,
                start_hour: 0,
                end_hour: 24,
                is_weekend: null,
            })
        }
        return res.data
    } catch (error) {
        toast.error(resExceptionMessageHandler(error))
    }
}

const fetchSubmitImage = async (images) => {
    const toastId = 'fetch-submit-image'
    const originalImage = images[0]
    try {
        const res = await axios.post(`${API_SERVER}/submit/${EVALUATION_ID}?session=${SESSION_ID}`, {
            answerSets: images.map((image) => ({
                taskId: 'string',
                taskName: 'string',
                answers: [
                    {
                        text: null,
                        mediaItemName: image,
                        mediaItemCollectionName: null,
                        start: null,
                        end: null,
                    },
                ],
            })),
        })
        const submission = res.data?.submission
        if (submission?.toUpperCase() === 'CORRECT') {
            toast.success(`Image ${originalImage} is Correct`, {
                toastId,
            })
        } else if (submission?.toUpperCase() === 'INDETERMINATE') {
            toast.success(`Image ${originalImage} is submitted`, {
                toastId,
            })
        } else {
            toast.error(`Image ${originalImage} is Incorrect`, {
                toastId,
            })
        }
        return res.data
    } catch (error) {
        const exception = { ...error }
        exception.response.data.error = `Can't submit image ${originalImage}.jpg`
        toast.error(resExceptionMessageHandler(exception), {
            toastId,
        })
    }
}

const fetchImageByTime = async (body) => {
    try {
        const res = await axios.post(`${API_ROOT}/image`, body)
        return res.data
    } catch (error) {
        toast.error(resExceptionMessageHandler(error))
    }
}

const fetchSubmitText = async (text) => {
    try {
        await Promise.all([
            axios.post(`${API_SERVER}/submit/${EVALUATION_ID}?session=${SESSION_ID}`, {
                answerSets: [
                    {
                        taskId: 'string',
                        taskName: 'string',
                        answers: [
                            {
                                text,
                                mediaItemName: null,
                                mediaItemCollectionName: null,
                                start: null,
                                end: null,
                            },
                        ],
                    },
                ],
            }),
        ])

        // await axios.get(`${API_SERVER}/submit?text=${text}&session=${SESSION_ID}`)
        toast.success('Submit text succesfully!')
    } catch (error) {
        toast.error(resExceptionMessageHandler(error))
    }
}

const fetchImagesFrom = async (relativePath) => {
    try {
        const res = await axios.post(`${imageConstant.IMAGE_SERVER}/get-images-from`, {
            relativePath,
        })

        return res.data
    } catch (error) {
        toast.error(resExceptionMessageHandler(error))
    }
}

const fetchRange = async () => {
    try {
        const res = await axios.get(`${imageConstant.IMAGE_SERVER}/range`)

        return res.data
    } catch (error) {
        toast.error(resExceptionMessageHandler(error))
    }
}

const saveImage = async (image) => {
    try {
        const res = await axios.post(`${imageConstant.IMAGE_SERVER}/save-image`, { image })

        toast.success(res.data)
    } catch (error) {
        toast.error(resExceptionMessageHandler(error))
    }
}

const removeImage = async (image) => {
    try {
        const res = await axios.post(`${imageConstant.IMAGE_SERVER}/remove-image`, { image })

        toast.success(res.data)
    } catch (error) {
        toast.error(resExceptionMessageHandler(error))
    }
}

const searchConversation = async (query, previousChat, hasSubmit) => {
    try {
        if (hasSubmit) {
            await axios.post(`${API_SERVER}/submit/${EVALUATION_ID}?session=${SESSION_ID}`, {
                answerSets: [
                    {
                        taskId: 'string',
                        taskName: 'string',
                        answers: [
                            {
                                text: query,
                                mediaItemName: null,
                                mediaItemCollectionName: null,
                                start: null,
                                end: null,
                            },
                        ],
                    },
                ],
            })
            toast.success('Submit text succesfully!')
            return
        }

        const res = await axios.post(`${API_ROOT}/conversational_search?api_key=1234`, {
            query,
            previous_chat: previousChat,
        })

        // const res = await fakeSearchConversation()

        return res.data
    } catch (error) {
        toast.error(resExceptionMessageHandler(error))
    }
}

const fetchVisualSimilarity = async (imageId, query) => {
    try {
        const res = await axios.post(`${API_ROOT}/visual_similarity?api_key=1234`, {
            image_id: imageId,
            query,
        })

        // const res = await fakeRequest({})

        return res.data
    } catch (error) {
        toast.error(resExceptionMessageHandler(error))
    }
}

export {
    fetchCurentEvent,
    fetchSubmitImage,
    fetchImageByTime,
    fetchSubmitText,
    fetchImagesFrom,
    fetchRange,
    saveImage,
    removeImage,
    searchConversation,
    fetchVisualSimilarity,
}
