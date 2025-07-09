import React, { Fragment, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { toast } from 'react-toastify'
import { connect } from 'react-redux'

import styles from './SimilarImages.module.scss'
import PopupImagesForm from '~/components/PopupImagesForm'
import { resExceptionMessageHandler } from '~/utils/helper'
import { fetchSubmitImage } from '~/apis'
import { handleGetSimilarImages, handleSaveImage } from '~/redux/logics/imageLogic'
import OverlayImageContainer from '~/containers/OverlayImageContainer'

const cx = classNames.bind(styles)

function SimilarImages({ images, hasSaveImages, saveImages, clearSimilarImages }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = useCallback(async () => {
        if (images.length > 0) {
            setIsLoading(true)
            try {
                // ".jpg" extention only used for "_id" or "ImageID", it's not impact link
                await Promise.all(images.map((item) => fetchSubmitImage([item.ImageID.split('.jpg')[0]])))
                clearSimilarImages()
                setIsLoading(false)
            } catch (error) {
                toast.error(resExceptionMessageHandler(error))
                setIsLoading(false)
            }

            hasSaveImages && saveImages(images)
        }
    }, [images, hasSaveImages])

    return (
        <PopupImagesForm
            title={'SIMILAR IMAGES'}
            isLoading={isLoading}
            isDisabled={images.length < 1}
            onSubmit={handleSubmit}
        >
            <div className={cx('container')}>
                {images.length > 0 ? (
                    <Fragment>
                        {images.map((item, index) => (
                            <div key={index} className={cx('container-item')}>
                                <OverlayImageContainer
                                    inforClassName={cx('information')}
                                    border
                                    enabledName
                                    hasInformation
                                    type={'add'}
                                    image={item}
                                    size={'fullsize'}
                                />
                            </div>
                        ))}
                    </Fragment>
                ) : (
                    <div className={cx('no-image')}>No similar image</div>
                )}
            </div>
        </PopupImagesForm>
    )
}

SimilarImages.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            ImageID: PropTypes.string.isRequired,
            new_name: PropTypes.string,
            event_id: PropTypes.string,
            local_time: PropTypes.string.isRequired,
            day_of_week: PropTypes.string.isRequired,
            image_link: PropTypes.string.isRequired,
        }),
    ),
    hasSaveImages: PropTypes.bool,
    saveImages: PropTypes.func,
    clearSimilarImages: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
    saveImages: (images) => dispatch(handleSaveImage(images)),
    clearSimilarImages: () => dispatch(handleGetSimilarImages([], false)),
})

export default connect(null, mapDispatchToProps)(React.memo(SimilarImages))
