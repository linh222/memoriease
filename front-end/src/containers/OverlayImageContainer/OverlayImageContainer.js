import React, { Fragment, useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import 'tippy.js/dist/tippy.css'
import { format, getDay } from 'date-fns'
import { toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'

import { dayOfWeek } from '~/utils/constants'
import { fetchSubmitImage } from '~/apis'
import { extractSimilarImageID, getSubmitImages, resExceptionMessageHandler } from '~/utils/helper'
import {
    handleGetImagesByTime,
    handleGetSimilarImages,
    handleRemoveMetadataImage,
    handleRemoveSavedImage,
    handleSaveImage,
    handleSaveMetadataImage,
} from '~/redux/logics/imageLogic'
import OverlayImage from '~/components/OverlayImage'
import { routes } from '~/routes'
import ZoomImage from '~/components/ZoomImage'

function OverlayImageContainer({
    image,
    hasLink,
    savedImage,
    saveImage,
    saveMetadataImage,
    removeSavedImage,
    removeMetadataImage,
    getSimilarImages,
    getImagesByTimeUsingLink,
    ...passProps
}) {
    const location = useLocation()
    const [isLoading, setIsLoading] = useState(false)
    const [isZoom, setIsZoom] = useState(false)

    const isSaved = useMemo(() => {
        const index = savedImage.findIndex((item) => item.ImageID === image.ImageID)
        return index > -1
    }, [savedImage, image])

    const handleOpenSimilarImage = useCallback(() => {
        const data = image.similar_images

        if (data) {
            const arr = data.map((link) => {
                const ImageID = extractSimilarImageID(link) // = ['201901', '01', '20190101_175458_000'][2] = '20190101_175458_000'
                const getDate = ImageID.split('_')[0] // = ['20190101', '175458', '000'][0] = '20190101'
                const getTime = ImageID.split('_')[1] // = ['20190101', '175458', '000'][0] = '175458'

                const year = getDate.substring(0, 4) // = 2019
                const month = getDate.substring(4, 6) // = 01
                const day = getDate.substring(6, 8) // = 01
                const hour = getTime.substring(0, 2) // 17
                const minute = getTime.substring(2, 4) // 54

                const similarImage = {
                    // ".jpg" extention only used for "_id" or "ImageID", it's not impact link
                    ImageID: `${ImageID}.jpg`,
                    new_name: '',
                    event_id: null,
                    local_time: `${year}-${month}-${day}T${hour}:${minute}:00`,
                    day_of_week: dayOfWeek[getDay(new Date(`${year}-${month}-${day}T${hour}:${minute}:00`))],
                    image_link: link,
                }

                return similarImage
            })

            getSimilarImages(arr, true)
        }
    }, [image])

    const handleSubmitImage = useCallback(
        (e) => {
            e.stopPropagation()
            const callAPI = async () => {
                setIsLoading(true)
                try {
                    await fetchSubmitImage(getSubmitImages(image, location.pathname === routes.visualSimilarity))
                    setIsLoading(false)
                } catch (error) {
                    toast.error(resExceptionMessageHandler(error))
                    setIsLoading(false)
                }
                saveImage(image)
            }
            callAPI()
        },
        [image, location.pathname],
    )

    const handleClickDateTime = useCallback(() => {
        if (hasLink) {
            const dateTime = new Date(image.local_time)
            const body = {
                day_month_year: format(dateTime, 'yyyy-MM-dd'),
                originalImage: image.ImageID,
            }
            getImagesByTimeUsingLink(body)
        }
    }, [hasLink, image])

    const stopPropagation = useCallback((e) => {
        e.stopPropagation()
    }, [])

    const handleSaveImage = useCallback(
        (e) => {
            saveImage(image)
            stopPropagation(e)
        },
        [image],
    )

    const handleRemoveSavedImage = useCallback(() => {
        removeSavedImage(image.ImageID)
    }, [image])

    const handleRemoveMetadataImage = useCallback(
        (e) => {
            removeMetadataImage(image)
            stopPropagation(e)
        },
        [image],
    )

    const handleSaveMetadataImage = useCallback(
        (e) => {
            saveMetadataImage(image)
            stopPropagation(e)
        },
        [image],
    )

    const handleZoomImage = useCallback(() => {
        setIsZoom((prev) => !prev)
    }, [])

    return (
        <Fragment>
            <OverlayImage
                image={image}
                isLoading={isLoading}
                isSaved={isSaved}
                hasLink={hasLink}
                onOpenSimilarImage={handleOpenSimilarImage}
                onSubmitImage={handleSubmitImage}
                onClickDateTime={handleClickDateTime}
                onSaveImage={handleSaveImage}
                onRemoveSavedImage={handleRemoveSavedImage}
                onRemoveMetadataImage={handleRemoveMetadataImage}
                onSaveMetadataImage={handleSaveMetadataImage}
                onStopPropagation={stopPropagation}
                onZoomImage={handleZoomImage}
                {...passProps}
            />
            {isZoom && <ZoomImage image={image} onClose={handleZoomImage} />}
        </Fragment>
    )
}

OverlayImageContainer.propTypes = {
    image: PropTypes.shape({
        ImageID: PropTypes.string.isRequired,
        new_name: PropTypes.string,
        event_id: PropTypes.number,
        local_time: PropTypes.string,
        day_of_week: PropTypes.string,
        image_link: PropTypes.string.isRequired,
        similar_images: PropTypes.array,
    }),
    savedImage: PropTypes.array,
    saveImage: PropTypes.func,
    saveMetadataImage: PropTypes.func,
    removeSavedImage: PropTypes.func,
    removeMetadataImage: PropTypes.func,
    getSimilarImages: PropTypes.func,
    getImagesByTimeUsingLink: PropTypes.func,
}

const mapStateToProps = (state) => ({
    savedImage: state.imageReducer.savedImage,
})

const mapDisptachToProps = (dispatch) => ({
    saveImage: (image) => dispatch(handleSaveImage(image)),
    removeSavedImage: (imageId) => dispatch(handleRemoveSavedImage(imageId)),
    saveMetadataImage: (image) => dispatch(handleSaveMetadataImage(image)),
    removeMetadataImage: (image) => dispatch(handleRemoveMetadataImage(image)),
    getSimilarImages: (images, isOpenPopup) => dispatch(handleGetSimilarImages(images, isOpenPopup)),
    getImagesByTimeUsingLink: (body) => dispatch(handleGetImagesByTime(body, true)),
})

export default connect(mapStateToProps, mapDisptachToProps)(React.memo(OverlayImageContainer))
