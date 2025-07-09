import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import GallaryContainer from '~/containers/GallaryContainer'
import { handleClearImages, handleClearSavedImage, handleVisualSimilarity } from '~/redux/logics/imageLogic'

function VisualSimilarity({ listImages, getVisialSimilarity, clearVisialSimilarity }) {
    useEffect(() => {
        getVisialSimilarity()
        return () => clearVisialSimilarity()
    }, [])

    return <GallaryContainer multiSelection images={listImages} />
}

VisualSimilarity.propType = {
    listImages: PropTypes.array,
    getVisialSimilarity: PropTypes.func,
    clearVisialSimilarity: PropTypes.func,
}

const mapStateToProps = (state) => ({
    listImages: state.imageReducer.listImages,
})

const mapDispatchToProps = (dispatch) => ({
    getVisialSimilarity: () => dispatch(handleVisualSimilarity([], '')),
    clearVisialSimilarity: () => {
        dispatch(handleClearImages())
        dispatch(handleClearSavedImage())
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(VisualSimilarity)
