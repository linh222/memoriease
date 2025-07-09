import React, { forwardRef, useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import styles from './Image.module.scss'
import images from '~/assets/images'

const cx = classNames.bind(styles)

const Image = forwardRef(
    ({ src, alt, absolute, hover, className, fallback: customFallback = images.noImage, ...props }, reference) => {
        const [fallback, setFallback] = useState('')

        const handleError = useCallback(() => {
            setFallback(customFallback)
        }, [])

        return (
            <img
                className={cx('image', { absolute, hover, [className]: className })}
                ref={reference}
                src={fallback || src}
                alt={alt}
                onMouseDown={(e) => e.preventDefault()}
                {...props}
                onError={handleError}
            />
        )
    },
)

Image.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    absolute: PropTypes.bool,
    hover: PropTypes.bool,
    className: PropTypes.string,
    fallback: PropTypes.string,
}

export default React.memo(Image)
