import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import styles from '~/scss/_inputClasses.module.scss'

const cx = classNames.bind(styles)

const Input = forwardRef(
    ({ textarea, label, lblClassName, error, borderStatus = '', className, ...passProps }, ref) => {
        const Comp = textarea ? 'textarea' : 'input'
        const inputRef = useRef()
        const [inputValue, setInputValue] = useState('')

        useImperativeHandle(
            ref,
            () => ({
                value: inputValue,

                focus: () => {
                    inputRef.current.focus()
                },
                blur: () => {
                    inputRef.current.blur()
                },
            }),
            [inputValue],
        )

        const handleOnChange = (value) => {
            setInputValue(value)
        }

        return (
            <div className={cx('wrapper')}>
                {label && <label className={cx('inp-label', { [lblClassName]: lblClassName })}>{label}</label>}
                <div className={cx('input-container')}>
                    <Comp
                        ref={inputRef}
                        className={cx('input-base', {
                            textarea,
                            [borderStatus]: borderStatus,
                            [className]: className,
                        })}
                        onChange={(e) => handleOnChange(e.target.value)}
                        {...passProps}
                    />
                </div>
                {error && <span className={cx('error-text')}>{error}</span>}
            </div>
        )
    },
)

Input.propTypes = {
    textarea: PropTypes.bool,
    label: PropTypes.string,
    lblClassName: PropTypes.string,
    error: PropTypes.string,
    borderStatus: PropTypes.oneOf(['success', 'error', '']),
    className: PropTypes.string,
}

export default React.memo(Input)
