import React from 'react'
import classNames from 'classnames/bind'

import styles from './DefaultLoading.module.scss'

const cx = classNames.bind(styles)

function DefaultLoading() {
    return <span className={cx('loader')} />
}

export default DefaultLoading
