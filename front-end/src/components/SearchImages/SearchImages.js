import React, { Fragment, useId } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { isEmpty } from 'lodash'
import { faUser } from '@fortawesome/free-solid-svg-icons'

import styles from './SearchImages.module.scss'
import SideBar from '~/components/SideBar'
import Input from '~/components/Input'
import Conversation from '~/components/Conversation'
import Button from '~/components/Button'
import Image from '~/components/Image'
import images from '~/assets/images'

const cx = classNames.bind(styles)

function SearchImages({ history, onSubmit, onToggleModal }) {
    const formId = useId()

    return (
        <SideBar title={'MemoriEase'}>
            <div className={cx('container')}>
                {history.map((item) => (
                    <Fragment key={item.id}>
                        {!isEmpty(item.bot) && <Conversation imgAvatar={images.logo} messages={item.bot} />}
                        <Conversation avatar={faUser} messages={[item.user]} reverse />
                    </Fragment>
                ))}
                <Conversation
                    imgAvatar={images.logo}
                    messages={[
                        'Hi there, I am MemoriEase, your personal assistant about your lifelog.',
                        'Feel free to ask me any things about your lifelog.',
                    ]}
                />
            </div>
            <form id={formId} className={cx('search-form')} autoComplete={'off'} onSubmit={onSubmit}>
                <Input name={'message'} className={cx('search-inp')} placeholder={'Whatever you want...'} />
                <button className={cx('send-btn')} type={'submit'}>
                    <Image src={images.send} alt={'send'} />
                </button>
            </form>
            <Button className={cx('submit-btn')} title={'Saved scence'} center fullsize onClick={onToggleModal} />
        </SideBar>
    )
}

SearchImages.propTypes = {
    history: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.number, user: PropTypes.string, bot: PropTypes.arrayOf(PropTypes.string) }),
    ),
    onSubmit: PropTypes.func,
    onToggleModal: PropTypes.func,
}

export default React.memo(SearchImages)
