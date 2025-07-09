import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import SavedScence from '~/components/SavedScence'
import CustomModal from '~/components/CustomModal'
import GallaryContainer from '~/containers/GallaryContainer'
import { handleToggleModal } from '~/redux/logics/globalLogic'

function Dashboard({ isOpenModal, listImages, toggleModal }) {
    return (
        <Fragment>
            <GallaryContainer images={listImages} />

            <CustomModal isOpenModal={isOpenModal} onClose={() => toggleModal(false)}>
                <SavedScence />
            </CustomModal>
        </Fragment>
    )
}

Dashboard.propTypes = {
    isOpenModal: PropTypes.bool,
    listImages: PropTypes.array,
    toggleModal: PropTypes.func,
}

const mapStateToProps = (state) => ({
    isOpenModal: state.globalReducer.isOpenModal,
    listImages: state.imageReducer.listImages,
})

const mapDisptachToProps = (dispatch) => ({
    toggleModal: (status) => {
        dispatch(handleToggleModal(status))
    },
})

export default connect(mapStateToProps, mapDisptachToProps)(Dashboard)
