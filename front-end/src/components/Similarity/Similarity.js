import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import styles from './Similarity.module.scss'
import SideBar from '~/components/SideBar'
import Button from '~/components/Button'
import Input from '~/components/Input'
import DefaultLoading from '~/components/Loading/DefaultLoading'
import OverlayImageContainer from '~/containers/OverlayImageContainer'

const cx = classNames.bind(styles)

function Similarity({ savedImage, isLoading, onChange, onSubmit }) {
    return (
        <SideBar title={'MemoriEase'}>
            <div className={cx('container')}>
                <div className={cx('saved-gallery')}>
                    {savedImage.map((image) => (
                        <div key={image.ImageID} className={cx('saved-gallery-item')}>
                            <OverlayImageContainer type={'remove'} image={image} />
                        </div>
                    ))}
                </div>
            </div>
            <Input
                name={'message'}
                className={cx('search-inp')}
                placeholder={'Enter your query...'}
                autoComplete={'off'}
                onChange={onChange}
            />
            {isLoading ? (
                <DefaultLoading />
            ) : (
                <Button className={cx('submit-btn')} title={'Search'} center fullsize onClick={onSubmit} />
            )}
        </SideBar>
    )
}

Similarity.propTypes = {
    savedImage: PropTypes.array,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
}

export default React.memo(Similarity)
