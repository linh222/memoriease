import React, { Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { Element, scroller } from 'react-scroll'
import { isEmpty } from 'lodash'

import styles from './ImagesByTime.module.scss'
import Loading from '~/components/Loading'
import OverlayImageContainer from '~/containers/OverlayImageContainer'

const cx = classNames.bind(styles)

function ImagesByTime({ images, navigateToImage, isLoading, dark, hasTitle, overlayType }) {
    useEffect(() => {
        if (navigateToImage) {
            scroller.scrollTo(navigateToImage, {
                containerId: 'custom-modal-id',
                smooth: true,
                duration: 1000,
                offset: -10,
            })
        }
    }, [navigateToImage])

    if (isLoading) {
        return <Loading />
    }

    return (
        <Fragment>
            {hasTitle && <h1 className={cx('title', dark ? 'dark-title' : '')}>Images By Time</h1>}
            {!isEmpty(images) && (
                <div className={cx('wrapper')}>
                    {images.map((item, index) => (
                        <div className={cx('container')} key={index}>
                            <Element name={item.time}>
                                <h2 className={dark ? cx('dark-title') : ''}>{item.time}</h2>
                                <div className={cx('gallery')}>
                                    {!isEmpty(item.images) &&
                                        item.images.map((image, indexChild) => (
                                            <div
                                                key={indexChild}
                                                style={{ width: '20%' }}
                                                className={cx(
                                                    'gallery-item',
                                                    navigateToImage === image.ImageID ? 'active' : '',
                                                )}
                                            >
                                                <Element name={image.ImageID}>
                                                    <OverlayImageContainer type={overlayType} image={image} />
                                                </Element>
                                            </div>
                                        ))}
                                </div>
                            </Element>
                        </div>
                    ))}
                </div>
            )}
        </Fragment>
    )
}

ImagesByTime.propTypes = {
    images: PropTypes.array,
    navigateToImage: PropTypes.string,
    hasTitle: PropTypes.bool,
    dark: PropTypes.bool,
    isLoading: PropTypes.bool,
    overlayType: PropTypes.oneOf(['add', 'submit', 'confirm']),
}

export default React.memo(ImagesByTime)
