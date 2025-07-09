import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { connect } from 'react-redux'

import FilterImages from '~/components/FilterImages'
import { fetchSubmitText } from '~/apis'
import { handleFetchingAPI, handleToggleModal } from '~/redux/logics/globalLogic'
import { handleGetImages } from '~/redux/logics/imageLogic'

function FilterImagesContainer({ imagesReqBody, toggleModal, getImages, fetchingAPI }) {
    const [beforeValue, setBeforeValue] = useState('')
    const [queryValue, setQueryValue] = useState('')
    const [afterValue, setAfterValue] = useState('')
    const [timeGap, setTimeGap] = useState('1')
    const [topicId, setTopicId] = useState('')
    const [visibleMore, setVisibleMore] = useState(false)
    const [textBox, setTextBox] = useState('')

    useEffect(() => {
        if (!isEmpty(imagesReqBody)) {
            const { previous_event, next_event, time_gap, query, topic } = imagesReqBody
            if (previous_event || next_event) {
                setVisibleMore(true)
            }
            if (beforeValue !== previous_event) {
                setBeforeValue(previous_event)
            }
            if (afterValue !== next_event) {
                setAfterValue(next_event)
            }
            if (queryValue !== query) {
                setQueryValue(query)
            }
            if (timeGap !== time_gap) {
                setTimeGap(time_gap)
            }
            if (topicId !== topic) {
                setTopicId(topic)
            }
        }
    }, [JSON.stringify(imagesReqBody)])

    const value = useMemo(
        () => ({ beforeValue, queryValue, afterValue, timeGap, topicId, textBox }),
        [beforeValue, queryValue, afterValue, timeGap, topicId, textBox],
    )

    const handleOnChange = useCallback((value, type) => {
        switch (type) {
            case 'before':
                setBeforeValue(value)
                break
            case 'time':
                setTimeGap(value)
                break
            case 'query':
                setQueryValue(value)
                break
            case 'after':
                setAfterValue(value)
                break
            case 'topic':
                setTopicId(value)
                break
            case 'text':
                setTextBox(value)
                break
            default:
                break
        }
    }, [])

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault()

            let body = {
                previous_event: beforeValue,
                next_event: afterValue,
                time_gap: timeGap,
                semantic_name: topicId,
            }

            // Handle submit if query is not null
            if (queryValue) {
                body = {
                    ...body,
                    query: queryValue,
                }
                fetchingAPI(true)
                getImages(1234, body)
            } else {
                toast.error('Please fill in "find" field!')
            }
        },
        [beforeValue, afterValue, timeGap, topicId, queryValue],
    )

    const handleSubmitText = useCallback(() => {
        if (textBox) {
            const submitText = async () => {
                await fetchSubmitText(textBox)
                setTextBox('')
            }

            submitText()
        }
    }, [textBox])

    const handleToggleModal = useCallback(() => {
        toggleModal(true)
    }, [])

    const handleVisibleMore = useCallback(() => {
        setVisibleMore((prev) => !prev)
    }, [])

    return (
        <FilterImages
            isVisibleMore={visibleMore}
            value={value}
            onVisibleMore={handleVisibleMore}
            onChange={handleOnChange}
            onSubmit={handleSubmit}
            onToggleModal={handleToggleModal}
            onSubmitText={handleSubmitText}
        />
    )
}

FilterImagesContainer.propTypes = {
    imagesReqBody: PropTypes.shape({
        previous_event: PropTypes.string,
        next_event: PropTypes.string,
        time_gap: PropTypes.string,
        query: PropTypes.string,
        topic: PropTypes.string,
    }),
    toggleModal: PropTypes.func,
    getImages: PropTypes.func,
    fetchingAPI: PropTypes.func,
}

const mapStateToProps = (state) => ({
    imagesReqBody: state.requestReducer.imagesReqBody,
})

const mapDispatchToProps = (dispatch) => ({
    toggleModal: (status) => dispatch(handleToggleModal(status)),
    getImages: (apiKey, body) => dispatch(handleGetImages(apiKey, body)),
    fetchingAPI: (status) => dispatch(handleFetchingAPI(status)),
})

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(FilterImagesContainer))
