import React, { Fragment, forwardRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons'

import styles from './Gallary.module.scss'
import Loading from '~/components/Loading'
import OverlayImageContainer from '~/containers/OverlayImageContainer'
import Button from '~/components/Button'

const cx = classNames.bind(styles)
const sortLabel = {
    ASC: faArrowUp,
    DESC: faArrowDown,
    DEFAULT: null,
}

const Gallary = forwardRef(
    (
        { DragSelection, isLoading, multiSelection, images, sortByName, sortByTime, onSortByName, onSortByTime },
        reference,
    ) => {
        return (
            <div className={cx('wrapper', 'gallary-wrapper')}>
                <div className={cx('sort-group')}>
                    <Button
                        className={cx('sort-btn')}
                        title={'sort by semantic name'}
                        icon={sortLabel[sortByName]}
                        onClick={onSortByName}
                    />
                    <Button
                        className={cx('sort-btn')}
                        title={'sort by time'}
                        icon={sortLabel[sortByTime]}
                        onClick={onSortByTime}
                    />
                </div>
                <div id={'gallary'}>
                    {isLoading && <Loading />}
                    {!isLoading && (
                        <Fragment>
                            {multiSelection && <DragSelection />}
                            <div className={cx('container')} ref={reference}>
                                {images.map((item, index) => (
                                    <div
                                        key={index}
                                        className={cx('gallery')}
                                        // This attribute is only used for multi selection on page /visual-similarity
                                        aria-valuenow={item.current_event._source.ImageID}
                                        style={{
                                            width:
                                                item.previous_event || item.next_event
                                                    ? 'calc(1 / 2 * 100%)'
                                                    : 'calc(1 / 5 * 100%)',
                                        }}
                                    >
                                        {item.previous_event?._id && (
                                            <OverlayImageContainer
                                                hasPopup
                                                border
                                                hasInformation
                                                type={'add'}
                                                image={item.previous_event._source}
                                                size={'extra-small'}
                                            />
                                        )}
                                        {item.current_event && (
                                            <OverlayImageContainer
                                                hasPopup
                                                border
                                                enabledName
                                                hasLink
                                                hasInformation
                                                spacing={(item.previous_event || item.next_event) && true}
                                                type={'add'}
                                                image={item.current_event._source}
                                                size={item.previous_event || item.next_event ? 'small' : 'fullsize'}
                                            />
                                        )}
                                        {item.next_event?._id && (
                                            <OverlayImageContainer
                                                hasPopup
                                                border
                                                hasInformation
                                                type={'add'}
                                                image={item.next_event._source}
                                                size={'extra-small'}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Fragment>
                    )}
                </div>
            </div>
        )
    },
)

Gallary.propTypes = {
    DragSelection: PropTypes.func,
    isLoading: PropTypes.bool,
    multiSelection: PropTypes.bool,
    images: PropTypes.arrayOf(
        PropTypes.shape({
            previous_event: PropTypes.object,
            current_event: PropTypes.object,
            next_event: PropTypes.object,
        }),
    ),
    sortByName: PropTypes.oneOf(['ASC', 'DESC', 'DEFAULT']),
    sortByTime: PropTypes.oneOf(['ASC', 'DESC', 'DEFAULT']),
    onSortByName: PropTypes.func,
    onSortByTime: PropTypes.func,
}

export default React.memo(Gallary)
