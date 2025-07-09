import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './Button.module.scss'

const cx = classNames.bind(styles)

function Button({
    to,
    icon,
    title,
    bold,
    fullsize,
    underline,
    center,
    className,
    disabled = false,
    onClick,
    ...passProps
}) {
    let Comp = 'button'

    const _props = {
        onClick,
        ...passProps,
    }

    if (to) {
        _props.to = to
        Comp = Link
    }

    if (disabled) {
        Object.keys(_props).forEach((key) => {
            if (key.startsWith('on') && typeof _props[key] === 'function') {
                delete _props[key]
            }
        })
    }

    return (
        <Comp
            className={cx('wrapper', {
                [className]: className,
                disabled,
                center,
                fullsize,
            })}
            {..._props}
        >
            {icon && (
                <span className={cx('content')}>
                    <FontAwesomeIcon icon={icon} />
                </span>
            )}
            {title && <span className={cx('content', { bold, underline })}>{title}</span>}
        </Comp>
    )
}

Button.propTypes = {
    to: PropTypes.string,
    icon: PropTypes.object,
    title: PropTypes.string,
    bold: PropTypes.bool,
    fullsize: PropTypes.bool,
    underline: PropTypes.bool,
    center: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
}

export default React.memo(Button)
