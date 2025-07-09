import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './Conversation.module.scss'
import Image from '~/components/Image'

const cx = classNames.bind(styles)

function Conversation({ avatar, imgAvatar, messages, reverse }) {
    return (
        <div className={cx('wrapper', reverse && 'reverse')}>
            <div className={cx('avatar')}>
                {avatar ? <FontAwesomeIcon icon={avatar} /> : <Image src={imgAvatar} alt={'avatar'} />}
            </div>
            <div className={cx('message-wrapper')}>
                {messages.map((message, index) => (
                    <div key={index} className={cx('message')}>
                        {message}
                    </div>
                ))}
            </div>
        </div>
    )
}

Conversation.propTypes = {
    avatar: PropTypes.object,
    imgAvatar: PropTypes.string,
    messages: PropTypes.arrayOf(PropTypes.string),
    reverse: PropTypes.bool,
}

export default React.memo(Conversation)
