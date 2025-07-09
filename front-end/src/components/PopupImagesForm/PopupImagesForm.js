import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark } from '@fortawesome/free-solid-svg-icons'
import { isNumber } from 'lodash'

import styles from './PopupImagesForm.module.scss'
import Button from '~/components/Button'
import DefaultLoading from '~/components/Loading/DefaultLoading'

const cx = classNames.bind(styles)

function PopupImagesForm({ children, title, numberImages, isLoading, onSubmit, isDisabled }) {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('title')}>
                <span>{title}</span>
                {isNumber(numberImages) && numberImages > 0 && (
                    <div className={cx('bookmark')}>
                        <FontAwesomeIcon icon={faBookmark} />
                        <span>{numberImages}</span>
                    </div>
                )}
            </div>
            <div className={cx('container')}>{children}</div>
            {!isLoading ? (
                <Button
                    className={cx('submit-btn')}
                    disabled={isDisabled}
                    title={'Submit'}
                    center
                    onClick={() => onSubmit()}
                />
            ) : (
                <div className={cx('loading')}>
                    <DefaultLoading />
                </div>
            )}
        </div>
    )
}

PopupImagesForm.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    numberImages: PropTypes.number,
    isLoading: PropTypes.bool,
    onSubmit: PropTypes.func,
    isDisabled: PropTypes.bool,
}

export default PopupImagesForm
