import React from 'react'
import { connect } from 'react-redux'

import ImagesByTime from '~/components/ImagesByTime'

function ImageByMetadata({ listImagesByMetadata, isFetchingAPI }) {
    return <ImagesByTime images={listImagesByMetadata} isLoading={isFetchingAPI} overlayType={'confirm'} />
}

const mapStateToProps = (state) => ({
    listImagesByMetadata: state.imageReducer.listImagesByMetadata,
    isFetchingAPI: state.globalReducer.isFetchingAPI,
})

export default connect(mapStateToProps, null)(ImageByMetadata)
