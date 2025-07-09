import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import CustomModal from '~/components/CustomModal'
import SimilarImages from '~/components/SimilarImages'
import ImagesByTime from '~/components/ImagesByTime'
import { handleGetSimilarImages } from '~/redux/logics/imageLogic'

function ImageByTime({ listImagesByTime, isFetchingAPI, similarImages, clearSimilarImages }) {
    return (
        <Fragment>
            <ImagesByTime images={listImagesByTime} isLoading={isFetchingAPI} overlayType={'add'} />
            <CustomModal isOpenModal={similarImages.isOpenPopup} onClose={() => clearSimilarImages()}>
                <SimilarImages images={similarImages.images} />
            </CustomModal>
        </Fragment>
    )
}

ImageByTime.propTypes = {
    listImages: PropTypes.array,
    isFetchingAPI: PropTypes.bool,
    similarImages: PropTypes.shape({
        isOpenModal: PropTypes.bool,
        images: PropTypes.arrayOf(
            PropTypes.shape({
                ImageID: PropTypes.string.isRequired,
                new_name: PropTypes.string,
                event_id: PropTypes.string,
                local_time: PropTypes.string.isRequired,
                day_of_week: PropTypes.string.isRequired,
                image_link: PropTypes.string.isRequired,
            }),
        ),
    }),
    clearSimilarImages: PropTypes.func,
}

const mapStateToProps = (state) => ({
    isOpenModal: state.globalReducer.isOpenModal,
    listImagesByTime: state.imageReducer.listImagesByTime,
    isFetchingAPI: state.globalReducer.isFetchingAPI,
    similarImages: state.imageReducer.similarImages,
})

const mapDisptachToProps = (dispatch) => ({
    clearSimilarImages: () => {
        dispatch(handleGetSimilarImages([], false))
    },
})

export default connect(mapStateToProps, mapDisptachToProps)(ImageByTime)
