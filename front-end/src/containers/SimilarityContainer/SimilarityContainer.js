import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Similarity from '~/components/Similarity'
import { handleVisualSimilarity } from '~/redux/logics/imageLogic'

function SimilarityContainer({ isFetchingAPI, savedImage, getVisualSimilarity }) {
    const [query, setQuery] = useState('')

    const handleOnChange = useCallback((e) => {
        setQuery(e.target.value)
    }, [])

    const handleSubmit = useCallback(() => {
        const imageIds = savedImage.map((image) => image.ImageID)
        getVisualSimilarity(imageIds, query)
    }, [query, savedImage])

    return (
        <Similarity
            isLoading={isFetchingAPI}
            savedImage={savedImage}
            disabled={isFetchingAPI}
            onSubmit={handleSubmit}
            onChange={handleOnChange}
        />
    )
}

SimilarityContainer.propTypes = {
    isFetchingAPI: PropTypes.bool,
    savedImage: PropTypes.array,
    getVisualSimilarity: PropTypes.func,
}

const mapStateToProps = (state) => ({
    isFetchingAPI: state.globalReducer.isFetchingAPI,
    savedImage: state.imageReducer.savedImage,
})

const mapDispatchToProps = (dispatch) => ({
    getVisualSimilarity: (imageIds, query) => dispatch(handleVisualSimilarity(imageIds, query)),
})

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SimilarityContainer))
