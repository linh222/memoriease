import React, { useCallback, useMemo, useState } from 'react'
import classNames from 'classnames/bind'
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

import styles from './Instruction.module.scss'
import { routes } from '~/routes'
import images from '~/assets/images'
import Image from '~/components/Image'

const cx = classNames.bind(styles)

function Instruction() {
    const location = useLocation()
    const [open, setOpen] = useState(false)

    const instructions = useMemo(
        () => ({
            [routes.chat]: [images.chatInstruction, images.chatInstructionNext],
            [routes.visualSimilarity]: [images.visualSimilarityIns, images.visualSimilarityInsNext],
            [routes.search]: [images.searchInstruction, images.searchInstructionNext, images.searchInstructionNext2],
        }),
        [],
    )

    const handleToggle = useCallback(() => {
        setOpen((prev) => !prev)
    }, [])

    return (
        <>
            {instructions[location.pathname] && (
                <Tippy content={'instruction'} placement={'bottom'}>
                    <FontAwesomeIcon className={cx('instruction-icon')} icon={faCircleInfo} onClick={handleToggle} />
                </Tippy>
            )}
            {open && (
                <div className={cx('wrapper')}>
                    <FontAwesomeIcon className={cx('cancel-icon')} icon={faXmark} onClick={handleToggle} />
                    <div className={cx('container')}>
                        {instructions[location.pathname].map((src) => (
                            <div className={cx('image-wrapper')}>
                                <Image key={src} src={src} alt={'instruction'} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default Instruction
