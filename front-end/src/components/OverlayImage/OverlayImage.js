import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faCloudArrowDown, faCheck, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { faFolderOpen, faTrashCan } from '@fortawesome/free-regular-svg-icons'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import { format } from 'date-fns'

import styles from './OverlayImage.module.scss'
import Image from '~/components/Image'
import { displayDayOfWeek } from '~/utils/constants'
import DefaultLoading from '~/components/Loading/DefaultLoading'

const cx = classNames.bind(styles)

function OverlayImage({
    isLoading,
    image,
    spacing,
    size = 'fullsize',
    border,
    type,
    enabledName,
    hasLink,
    hasInformation,
    inforClassName,
    hasPopup = false,
    isSaved,
    onStopPropagation,
    onSaveImage,
    onSubmitImage,
    onRemoveMetadataImage,
    onSaveMetadataImage,
    onRemoveSavedImage,
    onOpenSimilarImage,
    onClickDateTime,
    onZoomImage,
}) {
    return (
        <div className={cx('wrapper', { spacing, [size]: size, ['has-information']: hasInformation })}>
            <div className={cx('container', isSaved && border ? ('box-shadow', 'border-image') : '')}>
                <Image className={cx('image')} absolute src={image.image_link} alt={image.new_name || image.ImageID} />
                <span className={cx('overlay-image-alt')}>{image.ImageID}</span>
                {isLoading ? (
                    <div className={cx('loading')} onClick={onStopPropagation}>
                        <DefaultLoading />
                    </div>
                ) : (
                    <div className={cx('middle-content')}>
                        {type === 'add' && !isSaved && (
                            <Tippy content={'save'} placement={'bottom'}>
                                <span className={cx('icon')} onClick={onSaveImage}>
                                    <FontAwesomeIcon icon={faBookmark} color={'#1769aa'} />
                                </span>
                            </Tippy>
                        )}
                        {type === 'remove' && (
                            <span className={cx('icon')} onClick={onRemoveSavedImage}>
                                <FontAwesomeIcon icon={faTrashCan} color={'red'} />
                            </span>
                        )}
                        {type === 'confirm' && (
                            <Fragment>
                                <span className={cx('icon')} onClick={onRemoveMetadataImage}>
                                    <FontAwesomeIcon icon={faTrashCan} color={'red'} />
                                </span>
                                <span className={cx('icon')} onClick={onSaveMetadataImage}>
                                    <FontAwesomeIcon icon={faCloudArrowDown} />
                                </span>
                            </Fragment>
                        )}
                        {hasPopup && (
                            <Tippy content={'open similar images'} placement={'bottom'}>
                                <span className={cx('icon')} onClick={onOpenSimilarImage}>
                                    <FontAwesomeIcon icon={faFolderOpen} color={'var(--warning)'} />
                                </span>
                            </Tippy>
                        )}
                        {(type === 'submit' || (type === 'add' && !isSaved)) && (
                            <Tippy content={'submit'} placement={'bottom'}>
                                <span className={cx('icon', 'submit-icon')} onClick={onSubmitImage}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>
                            </Tippy>
                        )}
                        {!isSaved && (
                            <Tippy content={'zoom'} placement={'bottom'}>
                                <span className={cx('icon')} onClick={onZoomImage}>
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </span>
                            </Tippy>
                        )}
                    </div>
                )}
            </div>
            {enabledName && (
                <div className={cx('information', { [inforClassName]: inforClassName })}>
                    {image.new_name && (
                        <Tippy content={image.new_name} placement={'bottom-start'}>
                            <span>{image.new_name}</span>
                        </Tippy>
                    )}
                    <Tippy
                        content={`${image.day_of_week}, ${format(new Date(image.local_time), 'HH:mm yyyy-MM-dd')}`}
                        placement={'bottom-start'}
                    >
                        <span className={hasLink ? cx('has-link') : ''} onClick={onClickDateTime}>
                            {displayDayOfWeek[image.day_of_week.toUpperCase()]},{' '}
                            {format(new Date(image.local_time), 'HH:mm yyyy-MM-dd')}
                        </span>
                    </Tippy>
                </div>
            )}
        </div>
    )
}

OverlayImage.propTypes = {
    image: PropTypes.shape({
        ImageID: PropTypes.string.isRequired,
        new_name: PropTypes.string,
        event_id: PropTypes.number,
        local_time: PropTypes.string,
        day_of_week: PropTypes.string,
        image_link: PropTypes.string.isRequired,
        similar_images: PropTypes.array,
    }),
    isLoading: PropTypes.bool,
    isSaved: PropTypes.bool,
    spacing: PropTypes.bool,
    size: PropTypes.oneOf(['fullsize', 'large', 'middle', 'small', 'extra-small']),
    type: PropTypes.oneOf(['add', 'remove', 'submit', 'confirm']),
    border: PropTypes.bool,
    hasInformation: PropTypes.bool,
    inforClassName: PropTypes.string,
    hasPopup: PropTypes.bool,
    enabledName: PropTypes.bool,
    hasLink: PropTypes.bool,
}

export default React.memo(OverlayImage)
