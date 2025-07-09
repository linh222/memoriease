import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { isEmpty } from 'lodash'
import { connect } from 'react-redux'

import styles from './Home.module.scss'
import Input from '~/components/Input'
import Button from '~/components/Button'
import { routes } from '~/routes'
import { handleSearchConversation } from '~/redux/logics/imageLogic'

const cx = classNames.bind(styles)

function Home({ searchConversation }) {
    const navigate = useNavigate()

    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        const query = e.target.search.value
        if (!isEmpty(query)) {
            searchConversation(query)
            navigate(routes.chat)
        }
    }, [])

    const handleSignout = useCallback(() => {
        localStorage.removeItem('photo-exhibition-app-user')
        navigate(routes.login)
    }, [])

    return (
        <div className={cx('wrapper')}>
            <Button className={cx('signout-btn')} center title={'Sign out'} onClick={handleSignout} />
            <div className={cx('container')}>
                <h1>MemoriEase</h1>

                <form className={cx('form')} onSubmit={handleSubmit} autoComplete={'off'}>
                    <Input name={'search'} className={cx('input')} placeholder={'Find any moment of your life'} />
                    <FontAwesomeIcon icon={faMagnifyingGlass} className={cx('icon')} />
                </form>

                <div className={cx('actions')}>
                    <Button className={cx('navigate-btn')} title={'Browse by time'} to={routes.imageByTime} bold />
                    <Button
                        className={cx('navigate-btn')}
                        title={'Browse by visual similarity'}
                        to={routes.visualSimilarity}
                        bold
                    />
                </div>
            </div>
        </div>
    )
}

Home.propTypes = {
    searchConversation: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({ searchConversation: (query) => dispatch(handleSearchConversation(query)) })

export default connect(null, mapDispatchToProps)(Home)
