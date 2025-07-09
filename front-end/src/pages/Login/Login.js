import React, { useCallback, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isEmpty } from 'lodash'
import classNames from 'classnames/bind'

import styles from './Login.module.scss'
import Input from '~/components/Input'
import Button from '~/components/Button'
import { routes } from '~/routes'

const cx = classNames.bind(styles)

function Login() {
    const formId = useId()
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')

    const handleChangeUserName = useCallback((event) => {
        setError('')
        setUserName(event.target.value)
    }, [])

    const handleChangePassword = useCallback((event) => {
        setError('')
        setPassword(event.target.value)
    }, [])

    const handleLogin = useCallback((event) => {
        event.preventDefault()
        const usernameInput = event.target.username.value
        const passwordInput = event.target.password.value

        if (usernameInput === 'memoriease' && passwordInput === 'linh1234@dcu') {
            localStorage.setItem('photo-exhibition-app-user', JSON.stringify({ user: formId }))
            setError('')
            setUserName('')
            setPassword('')
            navigate(routes.home)
        } else {
            setError('Wrong username or password!')
        }
    }, [])

    return (
        <div className={cx('wrapper')}>
            <form id={formId} className={cx('login-form')} autoComplete={'off'} onSubmit={handleLogin}>
                <h1>Login</h1>
                <div className={cx('input-group')}>
                    <label className={cx('username-label')}>User name</label>
                    <Input
                        name={'username'}
                        className={cx('login-input')}
                        placeholder={'Enter your user name'}
                        value={userName}
                        onChange={handleChangeUserName}
                    />
                </div>
                <div className={cx('input-group')}>
                    <label className={cx('username-label')}>Password</label>
                    <Input
                        name={'password'}
                        className={cx('login-input')}
                        placeholder={'Enter your password'}
                        type={'password'}
                        value={password}
                        onChange={handleChangePassword}
                    />
                    {!isEmpty(error) && <div className={cx('error-label')}>{error}</div>}
                </div>
                <Button
                    className={cx('submit-btn')}
                    center
                    type={'submit'}
                    title={'Login'}
                    disabled={isEmpty(userName) || isEmpty(password)}
                />
            </form>
        </div>
    )
}

export default Login
