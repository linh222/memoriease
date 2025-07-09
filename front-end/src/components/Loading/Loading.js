import React from 'react'
import classNames from 'classnames/bind'

import styles from './Loading.module.scss'

const cx = classNames.bind(styles)

function Loading() {
    return (
        <div className={cx('wrapper')}>
            <span className={cx('loader')}>Loading...</span>
        </div>
    )
}

export default Loading
