import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { scroller } from 'react-scroll'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { endOfToday, getDate, getMonth, getYear, startOfToday } from 'date-fns'
import { connect } from 'react-redux'

import FilterByTime from '~/components/FilterByTime'
import { fetchRange } from '~/apis'
import { handleFetchingAPI } from '~/redux/logics/globalLogic'
import { handleGetImagesByMetadata } from '~/redux/logics/imageLogic'

function FilterByMetadataContainer({ listImagesByMetadata, fetchingAPI, getImagesByMetadata }) {
    const [dateTime, setDateTime] = useState(new Date(2023, 6, 27))
    const [dateRange, setDateRange] = useState({ minDate: startOfToday(), maxDate: endOfToday() })
    const [user, setUser] = useState('')

    const stOptions = useMemo(
        () => ['user01', 'user02', 'user03', 'user04', 'user05', 'user06', 'user07', 'user08', 'user09', 'user10'],
        [],
    )

    const pickerOptions = useMemo(
        () =>
            listImagesByMetadata.map((item) => {
                const [hour] = item.time.split('h')

                return {
                    number: hour * 1,
                    text: `${hour}:00`,
                }
            }),

        [JSON.stringify(listImagesByMetadata)],
    )

    useEffect(() => {
        fetchRange().then((res) => {
            if (res) {
                setDateTime(new Date(res.minDate))
                setDateRange({ minDate: new Date(res.minDate), maxDate: new Date(res.maxDate) })
            }
        })
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (isEmpty(user)) {
            toast.error('Please select user !')
        } else {
            const year = getYear(dateTime)
            let month = getMonth(dateTime) + 1
            month = month > 9 ? month : `0${month}`
            const date = getDate(dateTime)

            fetchingAPI(true)
            getImagesByMetadata(user, year, month, date)
        }
    }

    const handleSelectDateTime = useCallback((value) => {
        setDateTime(value)
    }, [])

    const handleSelectUser = useCallback((value) => {
        setUser(value)
    }, [])

    const handlePicker = useCallback((value) => {
        scroller.scrollTo(`${value}h`, { smooth: true, duration: 100, offset: -30 })
    }, [])

    return (
        <FilterByTime
            title={'MemoriLens'}
            dateTime={dateTime}
            stSelectLbl={'User'}
            stSelected={user}
            stOptions={stOptions}
            pickerOptions={pickerOptions}
            dateRange={dateRange}
            onSubmit={handleSubmit}
            onSelectDateTime={handleSelectDateTime}
            onStSelected={handleSelectUser}
            onPicker={handlePicker}
        />
    )
}

FilterByMetadataContainer.propTypes = {
    fetchingAPI: PropTypes.func,
    getImagesByMetadata: PropTypes.func,
    listImagesByMetadata: PropTypes.arrayOf(
        PropTypes.shape({
            time: PropTypes.string.isRequired,
            images: PropTypes.arrayOf(
                PropTypes.shape({
                    ImageID: PropTypes.string,
                    local_time: PropTypes.string,
                    image_link: PropTypes.string,
                    similar_images: PropTypes.array,
                }),
            ),
        }),
    ),
}

const mapStateToProps = (state) => ({
    listImagesByMetadata: state.imageReducer.listImagesByMetadata,
})

const mapDispatchToProps = (dispatch) => ({
    getImagesByMetadata: (user, year, month, date) => {
        dispatch(handleGetImagesByMetadata(user, year, month, date))
    },
    fetchingAPI: (status) => {
        dispatch(handleFetchingAPI(status))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(FilterByMetadataContainer))
