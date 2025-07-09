import React, { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import Tippy from '@tippyjs/react/headless'
import 'tippy.js/dist/tippy.css'

import styles from '~/scss/_inputClasses.module.scss'
import Input from '~/components/Input'

const cx = classNames.bind(styles)

function Select({ value, label, options = [], className, lblClassName, error, borderStatus = '', onSelect }) {
    const [isVisible, setIsVisible] = useState(false)

    const handleOnChange = (val) => {
        onSelect(val)
    }

    return (
        <div className={cx('wrapper')}>
            {label && <label className={cx('inp-label', { [lblClassName]: lblClassName })}>{label}:</label>}

            <Tippy
                interactive
                visible={isVisible}
                onClickOutside={() => setIsVisible(false)}
                placement={'bottom'}
                render={(attrs) => (
                    <div className={cx('option-wrapper')} tabIndex={'-1'} {...attrs}>
                        {options.map((option, index) => (
                            <span className={cx('option')} key={index} onClick={() => handleOnChange(option)}>
                                {option}
                            </span>
                        ))}
                    </div>
                )}
            >
                <div className={cx('input-container')}>
                    <Input
                        className={className}
                        value={value}
                        readOnly
                        error={error}
                        borderStatus={borderStatus}
                        placeholder={`Select ${label?.toLowerCase()}`}
                        onFocus={() => setIsVisible(true)}
                    />
                </div>
            </Tippy>
        </div>
    )
}

Select.propTypes = {
    value: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
    lblClassName: PropTypes.string,
    error: PropTypes.string,
    borderStatus: PropTypes.oneOf(['success', 'error', '']),
    className: PropTypes.string,
    onSelect: PropTypes.func,
}

export default React.memo(Select)
