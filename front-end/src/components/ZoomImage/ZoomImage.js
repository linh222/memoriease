import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { format } from 'date-fns'

import styles from './ZoomImage.module.scss'
import Image from '~/components/Image'
import { displayDayOfWeek } from '~/utils/constants'

const cx = classNames.bind(styles)

function ZoomImage({ image, onClose }) {
    return (
        <div className={cx('wrapper')} onClick={onClose}>
            <div className={cx('container')}>
                <div className={cx('image-container')}>
                    <Image
                        className={cx('image')}
                        absolute
                        src={image.image_link}
                        alt={image.new_name || image.ImageID}
                    />
                </div>
                <div className={cx('information')}>
                    {image.new_name && <span>{image.new_name}</span>}

                    <span>
                        {displayDayOfWeek[image.day_of_week.toUpperCase()]},{' '}
                        {format(new Date(image.local_time), 'HH:mm yyyy-MM-dd')}
                    </span>
                </div>
            </div>
        </div>
    )
}

ZoomImage.propTypes = {
    image: PropTypes.shape({
        new_name: PropTypes.string,
        event_id: PropTypes.number,
        local_time: PropTypes.string,
        day_of_week: PropTypes.string,
        image_link: PropTypes.string.isRequired,
    }),
    onClose: PropTypes.func,
}

export default React.memo(ZoomImage)
