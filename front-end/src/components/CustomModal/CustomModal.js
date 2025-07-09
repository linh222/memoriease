import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import styles from './CustomModal.module.scss'
import Button from '~/components/Button'

const cx = classNames.bind(styles)

function CustomModal({ isOpenModal, onClose, children }) {
    return (
        <Fragment>
            {isOpenModal && (
                <div className={cx('wrapper')} onClick={() => onClose()}>
                    <div id={'custom-modal-id'} className={cx('container')} onClick={(e) => e.stopPropagation()}>
                        {children}
                        <Button className={cx('close-btn')} icon={faXmark} center onClick={() => onClose()} />
                    </div>
                </div>
            )}
        </Fragment>
    )
}

CustomModal.propTypes = {
    isOpenModal: PropTypes.bool,
    onClose: PropTypes.func,
    children: PropTypes.node.isRequired,
}

export default CustomModal
