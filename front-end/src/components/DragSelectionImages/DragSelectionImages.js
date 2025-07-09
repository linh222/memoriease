import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { toast } from 'react-toastify'

import styles from './DragSelectionImages.module.scss'
import PopupImagesForm from '~/components/PopupImagesForm'
import OverlayImage from '~/components/OverlayImage'
import { getSubmitImages, resExceptionMessageHandler } from '~/utils/helper'
import { fetchSubmitImage } from '~/apis'

const cx = classNames.bind(styles)

function DragSelectionImages({ images, onRemove, onSaveImages }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = useCallback(async () => {
        if (images.length > 0) {
            setIsLoading(true)
            try {
                await Promise.all(images.map((item) => fetchSubmitImage(getSubmitImages(item, true))))
                setIsLoading(false)
            } catch (error) {
                toast.error(resExceptionMessageHandler(error))
                setIsLoading(false)
            }
            onSaveImages(images)
        }
    }, [images])

    return (
        <PopupImagesForm
            title={'MULTIPLE SUBMITED IMAGES'}
            isLoading={isLoading}
            isDisabled={images.length < 1}
            onSubmit={handleSubmit}
        >
            <div className={cx('container')}>
                {images.map((item, index) => (
                    <div key={index} className={cx('container-item')}>
                        <OverlayImage
                            inforClassName={cx('information')}
                            image={item}
                            isLoading={isLoading}
                            type={'remove'}
                            enabledName
                            hasInformation
                            onRemoveSavedImage={() => onRemove(item.ImageID)}
                        />
                    </div>
                ))}
            </div>
        </PopupImagesForm>
    )
}

DragSelectionImages.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            ImageID: PropTypes.string.isRequired,
            new_name: PropTypes.string,
            event_id: PropTypes.number,
            local_time: PropTypes.string,
            day_of_week: PropTypes.string,
            image_link: PropTypes.string.isRequired,
            similar_images: PropTypes.array,
        }),
    ),
    onRemove: PropTypes.func,
    onSaveImages: PropTypes.func,
}

export default React.memo(DragSelectionImages)
