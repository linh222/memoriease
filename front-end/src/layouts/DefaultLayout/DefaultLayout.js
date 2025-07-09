import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import styles from './DefaultLayout.module.scss'
import Button from '~/components/Button'
import Instruction from '~/layouts/components/Instruction'
import { routes } from '~/routes'
import ToTop from '~/components/ToTop'

const cx = classNames.bind(styles)
const navigateLinks = [
    { name: 'Home', path: routes.home },
    { name: 'KIS task', path: routes.search, target: '_blank' },
    { name: 'Adhoc task', path: routes.visualSimilarity, target: '_blank' },
    { name: 'QA task', path: routes.chat, target: '_blank' },
]

function DefaultLayout({ children, sidebar }) {
    return (
        <Fragment>
            {sidebar}
            <div className={cx('sidebar-wrapper', 'expand')}>
                <div className={cx('header')}>
                    <Instruction />
                    <h1>Result</h1>
                    <div className={cx('navigate')}>
                        {navigateLinks.map((item) => (
                            <Button
                                key={item.name}
                                className={cx('navigate-btn')}
                                title={item.name}
                                to={item.path}
                                target={item.target}
                                bold
                            />
                        ))}
                    </div>
                </div>
                {children}
            </div>
            <ToTop />
        </Fragment>
    )
}

DefaultLayout.propTypes = {
    children: PropTypes.node,
    sidebar: PropTypes.node,
    goToPage: PropTypes.string,
    linkName: PropTypes.string,
}

export default React.memo(DefaultLayout)
