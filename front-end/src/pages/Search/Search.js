import React, { Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { handleClearConversation } from '~/redux/logics/imageLogic'
import CustomModal from '~/components/CustomModal'
import SavedScence from '~/components/SavedScence'
import { handleToggleModal } from '~/redux/logics/globalLogic'
import GallaryContainer from '~/containers/GallaryContainer'

function Search({ conversation, isOpenModal, clearSearchConversation, toggleModal }) {
    const { images } = conversation

    useEffect(() => {
        return () => clearSearchConversation()
    }, [])

    return (
        <Fragment>
            <GallaryContainer images={images} />

            <CustomModal isOpenModal={isOpenModal} onClose={() => toggleModal(false)}>
                <SavedScence />
            </CustomModal>
        </Fragment>
    )
}

Search.propTypes = {
    isOpenModal: PropTypes.bool,
    conversation: PropTypes.shape({
        previousChat: PropTypes.arrayOf(PropTypes.string),
        images: PropTypes.array,
        textualAnswer: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    }),
    clearSearchConversation: PropTypes.func,
    toggleModal: PropTypes.func,
}

const mapStateToProps = (state) => ({
    isOpenModal: state.globalReducer.isOpenModal,
    conversation: state.imageReducer.conversation,
})

const mapDispatchToProps = (dispatch) => ({
    clearSearchConversation: () => dispatch(handleClearConversation()),
    toggleModal: (status) => dispatch(handleToggleModal(status)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Search)
