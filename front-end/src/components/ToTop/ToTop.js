import React, { useState, Fragment, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesUp } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames/bind'

import styles from './ToTop.module.scss'

const cx = classNames.bind(styles)

function ToTop() {
    const [visible, setVisible] = useState(false)
    const toggleVisibility = () => {
        if (window.pageYOffset > 400) {
            setVisible(true)
        } else {
            setVisible(false)
        }
    }

    const scrollToTop = () => {
        window.scrollTo(0, 0)
    }

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility)

        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])
    return (
        <Fragment>
            {visible && (
                <button className={cx('wrapper')} onClick={scrollToTop}>
                    <FontAwesomeIcon icon={faAnglesUp} />
                </button>
            )}
        </Fragment>
    )
}

export default ToTop
