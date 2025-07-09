import React, { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

import styles from './SideBar.module.scss'

const cx = classNames.bind(styles)

function SideBar({ children, className, title }) {
    const [isVisible, setIsVisible] = useState(true)

    return (
        <div className={cx('wrapper', { [className]: className, 'hide-nav slide-left-right': !isVisible })}>
            <h1 className={cx('title')}>{title}</h1>
            <button className={cx('toggle-btn')} onClick={() => setIsVisible(!isVisible)}>
                <FontAwesomeIcon icon={isVisible ? faChevronLeft : faChevronRight} />
            </button>
            {children}
        </div>
    )
}

SideBar.propTypes = {
    children: PropTypes.node.isRequired,
    classNames: PropTypes.string,
    title: PropTypes.string.isRequired,
}

export default React.memo(SideBar)
