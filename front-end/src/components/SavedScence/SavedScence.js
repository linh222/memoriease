import React, { useState } from 'react'
import classNames from 'classnames/bind'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { isEmpty } from 'lodash'

import styles from './SavedScence.module.scss'
import { resExceptionMessageHandler } from '~/utils/helper'
import PopupImagesForm from '~/components/PopupImagesForm'
import { fetchSubmitImage } from '~/apis'
import { handleToggleModal } from '~/redux/logics/globalLogic'
import { handleClearSavedImage } from '~/redux/logics/imageLogic'
import OverlayImageContainer from '~/containers/OverlayImageContainer'

const cx = classNames.bind(styles)

function SavedScence({ savedImage, clearSaveImage, toggleModal }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        setIsLoading(true)

        try {
            // ".jpg" extention only used for "_id" or "ImageID", it's not impact link
            await Promise.all(savedImage.map((item) => fetchSubmitImage([item.ImageID.split('.jpg')[0]])))
            clearSaveImage()
            toggleModal(false)
            setIsLoading(false)
        } catch (error) {
            toast.error(resExceptionMessageHandler(error))
            setIsLoading(false)
        }
    }

    return (
        <PopupImagesForm
            title={'SAVED SCENCES'}
            numberImages={savedImage.length}
            isLoading={isLoading}
            isDisabled={isEmpty(savedImage)}
            onSubmit={handleSubmit}
        >
            <div className={cx('saved-gallery')}>
                {savedImage.map((image) => (
                    <div key={image.ImageID} className={cx('saved-gallery-item')}>
                        <OverlayImageContainer type={'remove'} image={image} />
                    </div>
                ))}
            </div>
        </PopupImagesForm>
    )
}

SavedScence.propTypes = {
    savedImage: PropTypes.array,
    clearSaveImage: PropTypes.func,
    toggleModal: PropTypes.func,
}

const mapStateToProps = (state) => ({
    savedImage: state.imageReducer.savedImage,
})

const mapDisptachToProps = (dispatch) => ({
    clearSaveImage: () => {
        dispatch(handleClearSavedImage())
    },
    toggleModal: (status) => {
        dispatch(handleToggleModal(status))
    },
})

export default connect(mapStateToProps, mapDisptachToProps)(React.memo(SavedScence))
