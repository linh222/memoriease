import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { Calendar } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { format } from 'date-fns'

import styles from './DateTimeInput.module.scss'
import Input from '~/components/Input'

const cx = classNames.bind(styles)

function DateTimeInput({ onChange, startDate, endDate, minDate, maxDate, calendarPos }) {
    const ref = useRef(null)

    const [fromDate, setFromDate] = useState(startDate)
    const [toDate, setToDate] = useState(endDate)

    const [isShowTimePicker, setIsShowTimePicker] = useState('')

    useEffect(() => {
        setFromDate(startDate)
    }, [startDate])

    useEffect(() => {
        const hideOnEscape = (e) => {
            if (e.key === 'Escape') {
                setIsShowTimePicker('')
            }
        }

        const checkIfClickedOutside = (e) => {
            if (isShowTimePicker && ref.current && !ref.current.contains(e.target)) {
                setIsShowTimePicker('')
            }
        }

        document.addEventListener('mousedown', checkIfClickedOutside)
        document.addEventListener('keydown', hideOnEscape)

        return () => {
            document.removeEventListener('mousedown', checkIfClickedOutside)
            document.removeEventListener('keydown', hideOnEscape)
        }
    }, [isShowTimePicker])

    const calendarDay = () => {
        if (isShowTimePicker === 'from' || isShowTimePicker === 'picker') {
            return fromDate
        }

        if (isShowTimePicker === 'to') {
            return toDate
        }
    }

    const handleSelect = (dateArg) => {
        if (isShowTimePicker === 'from') {
            if (dateArg > toDate) {
                setFromDate(toDate)
                setToDate(dateArg)
                onChange({ startDate: toDate, endDate: dateArg })
            } else {
                setFromDate(dateArg)
                onChange({ startDate: dateArg, endDate: toDate })
            }
        } else if (isShowTimePicker === 'to') {
            if (dateArg < fromDate) {
                setToDate(fromDate)
                setFromDate(dateArg)
                onChange({ startDate: dateArg, endDate: fromDate })
            } else {
                setToDate(dateArg)
                onChange({ startDate: fromDate, endDate: dateArg })
            }
        } else if (isShowTimePicker === 'picker') {
            setFromDate(dateArg)
            onChange(dateArg)
        }
    }

    return (
        <div ref={ref} className={cx('wrapper')}>
            <div className={cx('container')}>
                <span className={cx('label', 'from')}>Date time:</span>
                <Input
                    value={`${format(fromDate, 'yyyy/MM/dd')}`}
                    onFocus={() => setIsShowTimePicker(endDate ? 'from' : 'picker')}
                />
                {endDate && (
                    <Fragment>
                        <span className={cx('to')}>to</span>
                        <Input value={`${format(toDate, 'yyyy/MM/dd')}`} onFocus={() => setIsShowTimePicker('to')} />
                    </Fragment>
                )}
            </div>
            {isShowTimePicker && (
                <div className={cx('calendar-wrapper', { [calendarPos]: calendarPos })}>
                    <Calendar
                        date={calendarDay()}
                        minDate={minDate}
                        maxDate={maxDate}
                        onChange={handleSelect}
                        color={'#06beb6'}
                    />
                </div>
            )}
        </div>
    )
}

DateTimeInput.propTypes = {
    onChange: PropTypes.func,
    startDate: PropTypes.instanceOf(Date).isRequired,
    endDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
    calendarPos: PropTypes.oneOf(['bottom', 'top']),
}

export default React.memo(DateTimeInput)
