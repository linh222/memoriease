import React, { useId } from 'react'
import classNames from 'classnames/bind'
import PropTypes from 'prop-types'

import styles from './FilterByTime.module.scss'
import SideBar from '~/components/SideBar'
import DateTimeInput from '~/components/DateTimeInput'
import Select from '~/components/Select'
import Button from '~/components/Button'
import TimePicker from '~/components/TimePicker'

const cx = classNames.bind(styles)

function FilterByTime({
    title,
    dateTime,
    stSelected,
    ndSelected,
    stSelectLbl,
    ndSelectLbl,
    stOptions,
    ndOptiopns,
    pickerOptions,
    dateRange,
    onSubmit,
    onSelectDateTime,
    onStSelected,
    onNdSelected,
    onPicker,
}) {
    const formId = useId()

    return (
        <SideBar classNames={cx('wrapper')} title={title}>
            <form id={formId} className={cx('container')} onSubmit={onSubmit}>
                <div className={cx('input-wrapper')}>
                    <DateTimeInput
                        startDate={dateTime}
                        onChange={onSelectDateTime}
                        minDate={dateRange.minDate}
                        maxDate={dateRange.maxDate}
                    />
                </div>
                <div className={cx('input-wrapper')}>
                    <Select
                        value={stSelected}
                        label={stSelectLbl}
                        lblClassName={'label'}
                        options={stOptions}
                        onSelect={onStSelected}
                    />
                </div>
                {ndSelectLbl && (
                    <div className={cx('input-wrapper')}>
                        <Select
                            value={ndSelected}
                            label={ndSelectLbl}
                            lblClassName={'label'}
                            options={ndOptiopns}
                            onSelect={onNdSelected}
                        />
                    </div>
                )}
                <Button className={cx('submit-btn')} title={'Search'} center />
                <div className={cx('time-picker-wrapper')}>
                    <span className={cx('title')}>Retrieve by hour</span>
                    <TimePicker onPicker={onPicker} options={pickerOptions} />
                </div>
            </form>
        </SideBar>
    )
}

FilterByTime.propTypes = {
    title: PropTypes.string.isRequired,
    dateTime: PropTypes.instanceOf(Date),
    stSelected: PropTypes.string,
    ndSelected: PropTypes.string,
    stSelectLbl: PropTypes.string,
    ndSelectLbl: PropTypes.string,
    stOptions: PropTypes.arrayOf(PropTypes.string.isRequired),
    ndOptiopns: PropTypes.arrayOf(PropTypes.string.isRequired),
    pickerOptions: PropTypes.arrayOf(
        PropTypes.shape({
            number: PropTypes.number.isRequired,
            text: PropTypes.string.isRequired,
        }),
    ),
    dateRange: PropTypes.shape({
        minDate: PropTypes.instanceOf(Date),
        maxDate: PropTypes.instanceOf(Date),
    }),
    onSubmit: PropTypes.func,
    onSelectDateTime: PropTypes.func,
    onStSelected: PropTypes.func,
    onNdSelected: PropTypes.func,
    onPicker: PropTypes.func,
}

export default React.memo(FilterByTime)
