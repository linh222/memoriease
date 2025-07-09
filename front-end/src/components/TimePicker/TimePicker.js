import React, { useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import styles from './TimePicker.module.scss'

const cx = classNames.bind(styles)

function TimePicker({ onPicker, options }) {
    const hourRef = useRef()
    const [currentHour, setCurrentHour] = useState(0)
    const ITEM_HEIGHT = 35

    const handlePicker = (value) => {
        setCurrentHour(value)
        onPicker(value)
        hourRef.current.scrollTo(0, ITEM_HEIGHT * value - ITEM_HEIGHT * 2)
    }

    return (
        <div className={cx('wrapper')} ref={hourRef}>
            {options.map((hour) => (
                <span
                    className={cx('item', currentHour === hour.number ? 'active' : '')}
                    key={hour.number}
                    onClick={() => handlePicker(hour.number)}
                >
                    {hour.text}
                </span>
            ))}
        </div>
    )
}

TimePicker.propTypes = {
    onPicker: PropTypes.func,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            number: PropTypes.number.isRequired,
            text: PropTypes.string.isRequired,
        }),
    ),
}

export default React.memo(TimePicker)
