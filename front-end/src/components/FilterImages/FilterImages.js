import React, { useId, Fragment } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import styles from './FilterImages.module.scss'
import Input from '~/components/Input'
import Button from '~/components/Button'
import SideBar from '~/components/SideBar'

const cx = classNames.bind(styles)

function FilterImages({ isVisibleMore, value, onChange, onSubmit, onVisibleMore, onToggleModal, onSubmitText }) {
    const formId = useId()
    const { beforeValue, queryValue, afterValue, timeGap, topicId, textBox } = value

    return (
        <SideBar className={cx('wrapper')} title={'MemoriEase'}>
            <form id={formId} className={cx('container')} onSubmit={onSubmit}>
                {isVisibleMore && (
                    <Fragment>
                        <div className={cx('input-wrapper')}>
                            <Input
                                textarea
                                value={beforeValue}
                                lblClassName={cx('label')}
                                label={'Before:'}
                                placeholder={'Example: I am at home'}
                                onChange={(e) => onChange(e.target.value, 'before')}
                            />
                        </div>
                        <div className={cx('input-wrapper', 'border-bottom-dash')}>
                            <div className={cx('input-container')}>
                                <Input
                                    className={cx('time-inp')}
                                    lblClassName={cx('label')}
                                    label={'when:'}
                                    type={'number'}
                                    min={1}
                                    value={timeGap}
                                    onChange={(e) => onChange(e.target.value, 'time')}
                                />
                                <span>hours</span>
                            </div>
                        </div>
                    </Fragment>
                )}

                <div className={cx('input-wrapper')}>
                    <Input
                        textarea
                        value={queryValue}
                        lblClassName={cx('label')}
                        label={'Find:'}
                        placeholder={'Example: I am at home'}
                        onChange={(e) => onChange(e.target.value, 'query')}
                    />
                </div>

                <div className={cx('input-wrapper')}>
                    <Input
                        value={topicId}
                        lblClassName={cx('label')}
                        label={'Semantic:'}
                        placeholder={'Enter semantic'}
                        onChange={(e) => onChange(e.target.value, 'topic')}
                    />
                </div>

                {isVisibleMore && (
                    <Fragment>
                        <div className={cx('input-wrapper', 'border-top-dash')}>
                            <Input
                                textarea
                                value={afterValue}
                                lblClassName={cx('label')}
                                label={'After:'}
                                placeholder={'Example: I am at home'}
                                onChange={(e) => onChange(e.target.value, 'after')}
                            />
                        </div>
                        <div className={cx('input-wrapper')}>
                            <div className={cx('input-container')}>
                                <Input
                                    className={cx('time-inp')}
                                    lblClassName={cx('label')}
                                    label={'when:'}
                                    type={'number'}
                                    min={1}
                                    value={timeGap}
                                    onChange={(e) => onChange(e.target.value, 'time')}
                                />
                                <span>hours</span>
                            </div>
                        </div>
                    </Fragment>
                )}

                <Button className={cx('submit-btn')} title={'Search'} center />
            </form>
            <Button
                className={cx('submit-btn')}
                title={isVisibleMore ? 'Show less' : 'Show more'}
                center
                fullsize
                onClick={onVisibleMore}
            />
            <Button
                className={cx('submit-btn', 'link')}
                title={'Saved scence'}
                center
                fullsize
                onClick={onToggleModal}
            />
            <div className={cx('text-box-container')}>
                <textarea
                    className={cx('text-box')}
                    placeholder={'Enter your answer for question answering topic here'}
                    value={textBox}
                    onChange={(e) => onChange(e.target.value, 'text')}
                />
                <span className={cx('send-button')} onClick={onSubmitText}>
                    <svg className="xsrhx6k" height="20px" viewBox="0 0 24 24" width="20px">
                        <path
                            d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"
                            fill="#ffffff"
                        ></path>
                    </svg>
                </span>
            </div>
        </SideBar>
    )
}

FilterImages.propTypes = {
    isVisibleMore: PropTypes.bool,
    value: PropTypes.shape({
        beforeValue: PropTypes.string,
        queryValue: PropTypes.string,
        afterValue: PropTypes.string,
        timeGap: PropTypes.string,
        topicId: PropTypes.string,
        textBox: PropTypes.string,
    }),
    onVisibleMore: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onToggleModal: PropTypes.func,
    onSubmitText: PropTypes.func,
}

export default React.memo(FilterImages)
