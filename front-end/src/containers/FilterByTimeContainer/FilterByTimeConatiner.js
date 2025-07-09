import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { scroller } from 'react-scroll'
import { format } from 'date-fns'
import { isEmpty } from 'lodash'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import FilterByTime from '~/components/FilterByTime'
import { handleFetchingAPI } from '~/redux/logics/globalLogic'
import { handleGetImagesByTime } from '~/redux/logics/imageLogic'

function FilterByTimeConatiner({ imagesByTimeReqBody, fetchingAPI, getImagesByTime }) {
    const [dateTime, setDateTime] = useState(new Date(2019, 0, 1))
    const [selectedTimePeriod, setSelectedTimePeriod] = useState('')
    const [selectedHour, setSelectedHour] = useState('')

    const dateRange = useMemo(() => ({ minDate: new Date(2019, 0, 1), maxDate: new Date(2020, 5, 30) }), [])

    const timePickerOptions = useMemo(
        () => [
            { number: 0, text: '00:00' },
            { number: 1, text: '01:00' },
            { number: 2, text: '02:00' },
            { number: 3, text: '03:00' },
            { number: 4, text: '04:00' },
            { number: 5, text: '05:00' },
            { number: 6, text: '06:00' },
            { number: 7, text: '07:00' },
            { number: 8, text: '08:00' },
            { number: 9, text: '09:00' },
            { number: 10, text: '10:00' },
            { number: 11, text: '11:00' },
            { number: 12, text: '12:00' },
            { number: 13, text: '13:00' },
            { number: 14, text: '14:00' },
            { number: 15, text: '15:00' },
            { number: 16, text: '16:00' },
            { number: 17, text: '17:00' },
            { number: 18, text: '18:00' },
            { number: 19, text: '19:00' },
            { number: 20, text: '20:00' },
            { number: 21, text: '21:00' },
            { number: 22, text: '22:00' },
            { number: 23, text: '23:00' },
        ],
        [],
    )
    const stOptions = useMemo(() => ['Early Morning', 'Morning', 'Noon', 'Afternoon', 'Night', 'Late Night'], [])
    const ndOptiopns = useMemo(
        () => [
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '22',
            '23',
        ],
        [],
    )

    useEffect(() => {
        if (!isEmpty(imagesByTimeReqBody)) {
            const { day_month_year, time_period, hour } = imagesByTimeReqBody
            if (dateTime !== day_month_year) {
                setDateTime(new Date(day_month_year))
            }
            if (selectedTimePeriod !== time_period) {
                setSelectedTimePeriod(time_period)
            }
            if (selectedHour !== hour) {
                setSelectedHour(hour)
            }
        }
    }, [imagesByTimeReqBody])

    const handleSubmit = (event) => {
        event.preventDefault()
        const body = {
            day_month_year: format(dateTime, 'yyyy-MM-dd'),
            time_period: selectedTimePeriod,
            hour: selectedHour,
        }
        fetchingAPI(true)
        getImagesByTime(body)
    }

    const handlePicker = useCallback((value) => {
        scroller.scrollTo(`${value}h`, { smooth: true, duration: 100, offset: -30 })
    }, [])

    const handleSelectDateTime = useCallback((value) => {
        setDateTime(value)
    }, [])

    const handleSelectedTimePeriod = useCallback((value) => {
        setSelectedTimePeriod(value)
    }, [])

    const handleSelectHour = useCallback((value) => {
        setSelectedHour(value)
    }, [])

    return (
        <FilterByTime
            title={'MemoriEase'}
            dateTime={dateTime}
            stSelected={selectedTimePeriod}
            stSelectLbl={'Time period'}
            stOptions={stOptions}
            ndSelected={selectedHour}
            ndSelectLbl={'Hour'}
            pickerOptions={timePickerOptions}
            ndOptiopns={ndOptiopns}
            dateRange={dateRange}
            onSubmit={handleSubmit}
            onSelectDateTime={handleSelectDateTime}
            onStSelected={handleSelectedTimePeriod}
            onNdSelected={handleSelectHour}
            onPicker={handlePicker}
        />
    )
}

FilterByTimeConatiner.propTypes = {
    imagesByTimeReqBody: PropTypes.shape({
        day_month_year: PropTypes.string,
        time_period: PropTypes.string,
        hour: PropTypes.string,
    }),
    getImagesByTime: PropTypes.func,
    fetchingAPI: PropTypes.func,
}

const mapStateToProps = (state) => ({
    imagesByTimeReqBody: state.requestReducer.imagesByTimeReqBody,
})

const mapDispatchToProps = (dispatch) => ({
    getImagesByTime: (body) => {
        dispatch(handleGetImagesByTime(body, false))
    },
    fetchingAPI: (status) => {
        dispatch(handleFetchingAPI(status))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(FilterByTimeConatiner))
