import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

import styles from './Pagination.module.scss'
import Button from '~/components/Button'

const cx = classNames.bind(styles)

function Pagination({ numberPage, currentPage, onChange, absolute }) {
    const [listPage, setListPage] = useState([])
    const MAX_PAGE_IN_LIST = 4

    useEffect(() => {
        if (numberPage <= MAX_PAGE_IN_LIST) {
            const arr = []

            for (let index = 0; index < numberPage; index++) {
                arr.push(index + 1)
            }
            setListPage(arr)
        } else {
            setListPage([1, 2, 3, 4])
        }
    }, [numberPage])

    const handlePageChange = (page) => {
        onChange(page)
    }

    const handlePrevPage = () => {
        const prevPage = currentPage - 1
        if (prevPage > 0) {
            onChange(prevPage)
            if (!listPage.includes(prevPage)) {
                setListPage([prevPage, prevPage + 1, prevPage + 2, prevPage + 3])
            }
        }
    }

    const handleNextPage = () => {
        const nextPage = currentPage + 1
        if (nextPage <= numberPage) {
            onChange(nextPage)
            if (!listPage.includes(nextPage)) {
                setListPage([nextPage - 3, nextPage - 2, nextPage - 1, nextPage])
            }
        }
    }

    return (
        <div className={cx('wrapper', { absolute })}>
            <div className={cx('container')}>
                {currentPage > 1 && <Button className={cx('page')} icon={faChevronLeft} onClick={handlePrevPage} />}
                {listPage.map((page) => (
                    <Button
                        className={cx('page', currentPage === page && 'current-page')}
                        title={page.toString()}
                        key={page}
                        onClick={() => handlePageChange(page)}
                    />
                ))}
                {numberPage > currentPage && (
                    <Button className={cx('page')} icon={faChevronRight} onClick={handleNextPage} />
                )}
            </div>
        </div>
    )
}

Pagination.propTypes = {
    numberPage: PropTypes.number,
    currentPage: PropTypes.number,
    onChange: PropTypes.func,
    absolute: PropTypes.bool,
}

export default React.memo(Pagination)
