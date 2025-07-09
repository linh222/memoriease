import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { cloneDeep, isEmpty, reverse, sortBy } from 'lodash'
import { boxesIntersect, useSelectionContainer } from '@air/react-drag-to-select'

import Gallary from '~/components/Gallary'
import ImagesByTime from '~/components/ImagesByTime'
import CustomModal from '~/components/CustomModal'
import SimilarImages from '~/components/SimilarImages'
import { handleGetImagesByTimeUsingLink, handleGetSimilarImages, handleSaveImage } from '~/redux/logics/imageLogic'
import DragSelectionImages from '~/components/DragSelectionImages'

function GallaryContainer({
    isFetchingAPI,
    multiSelection,
    images,
    imagesByTimeUsingLink,
    savedImage,
    similarImages,
    saveImages,
    clearImagesByTimeUsingLink,
    clearSimilarImages,
}) {
    const [selectedIndexes, setSelectedIndexes] = useState([])
    const [selectedImages, setSelectedImages] = useState([])
    const [sortByName, setSortByName] = useState('DEFAULT')
    const [sortByTime, setSortByTime] = useState('DEFAULT')
    const [sortedImages, setSortedImages] = useState([])
    const selectableItems = useRef([])
    const elementsContainerRef = useRef(null)

    useEffect(() => {
        const sortObject = (obj, orderBy, order, isTime) => {
            const cloneObj = cloneDeep(obj)
            const sortedObj = sortBy(cloneObj, (item) =>
                isTime ? new Date(item.current_event._source[orderBy]).getTime() : item.current_event._source[orderBy],
            )

            return order === 'DESC' ? reverse(sortedObj) : sortedObj
        }

        if (sortByName !== 'DEFAULT') {
            setSortedImages(sortObject(images, 'new_name', sortByName, false))
        } else if (sortByTime !== 'DEFAULT') {
            setSortedImages(sortObject(images, 'local_time', sortByTime, true))
        } else {
            setSortedImages(images)
        }
    }, [images, sortByName, sortByTime])

    useEffect(() => {
        if (elementsContainerRef.current) {
            Array.from(elementsContainerRef.current.children).forEach((item) => {
                const { left, top, width, height } = item.getBoundingClientRect()
                selectableItems.current.push({
                    left,
                    top,
                    width,
                    height,
                    ImageID: item.getAttribute('aria-valuenow'),
                })
            })
        }

        return () => {
            selectableItems.current = []
        }
    }, [elementsContainerRef.current])

    const { DragSelection } = useSelectionContainer({
        eventsElement: document.getElementById('gallary'),
        onSelectionChange: (box) => {
            const scrollAwareBox = {
                ...box,
                top: box.top + window.scrollY,
                left: box.left + window.scrollX,
            }

            const indexesToSelect = []
            selectableItems.current.forEach((item, index) => {
                if (boxesIntersect(scrollAwareBox, item) && box.width > 50 && box.height > 50) {
                    indexesToSelect.push(item.ImageID)
                }
            })

            setSelectedIndexes(indexesToSelect)
        },
        onSelectionStart: () => {
            console.log('OnSelectionStart')
        },
        onSelectionEnd: () => {
            if (multiSelection) {
                const cloneImages = cloneDeep(sortedImages)
                const savedImageIds = savedImage.map((item) => item.ImageID)

                setSelectedImages(
                    cloneImages
                        .filter(
                            (cloneImage) =>
                                selectedIndexes.includes(cloneImage.current_event._source.ImageID) &&
                                !savedImageIds.includes(cloneImage.current_event._source.ImageID),
                        )
                        .map((item) => item.current_event._source),
                )
            }
        },
        selectionProps: {
            style: {
                border: '2px dashed purple',
                borderRadius: 4,
                backgroundColor: 'brown',
                opacity: 0.5,
                zIndex: 5,
            },
        },
        isEnabled: true,
    })

    const handleCloseImagesByTime = useCallback(() => {
        clearImagesByTimeUsingLink()
    }, [])

    const handleCloseSimilarImages = useCallback(() => {
        clearSimilarImages()
    }, [])

    const handleRemoveDragSelection = useCallback((ImageID) => {
        setSelectedImages((prev) => prev.filter((item) => item.ImageID !== ImageID))
    }, [])

    const handleCloseDragSelection = useCallback(() => {
        setSelectedImages([])
    }, [])

    const handleSaveDragImages = useCallback(
        (imagesArg) => {
            saveImages(imagesArg)
            handleCloseDragSelection()
        },
        [handleCloseDragSelection],
    )

    const handleSortByName = useCallback(() => {
        switch (sortByName) {
            case 'ASC':
                setSortByName('DESC')
                break
            case 'DESC':
                setSortByName('DEFAULT')
                break
            default:
                setSortByName('ASC')
                setSortByTime('DEFAULT')
                break
        }
    }, [sortByName])

    const handleSortByTime = useCallback(() => {
        switch (sortByTime) {
            case 'ASC':
                setSortByTime('DESC')
                break
            case 'DESC':
                setSortByTime('DEFAULT')
                break
            default:
                setSortByTime('ASC')
                setSortByName('DEFAULT')
                break
        }
    }, [sortByTime])

    return (
        <Fragment>
            <Gallary
                ref={elementsContainerRef}
                DragSelection={DragSelection}
                isLoading={isFetchingAPI}
                multiSelection={multiSelection}
                images={sortedImages}
                sortByName={sortByName}
                sortByTime={sortByTime}
                onSortByName={handleSortByName}
                onSortByTime={handleSortByTime}
            />
            <CustomModal isOpenModal={imagesByTimeUsingLink.isOpenPopup} onClose={handleCloseImagesByTime}>
                <ImagesByTime
                    images={imagesByTimeUsingLink.images}
                    navigateToImage={imagesByTimeUsingLink.originalImage}
                    isLoading={imagesByTimeUsingLink.isLoading}
                    hasTitle
                    dark
                    overlayType={'submit'}
                />
            </CustomModal>
            <CustomModal isOpenModal={similarImages.isOpenPopup} onClose={handleCloseSimilarImages}>
                <SimilarImages images={similarImages.images} hasSaveImages={multiSelection} />
            </CustomModal>
            <CustomModal isOpenModal={!isEmpty(selectedImages)} onClose={handleCloseDragSelection}>
                <DragSelectionImages
                    images={selectedImages}
                    onRemove={handleRemoveDragSelection}
                    onSaveImages={handleSaveDragImages}
                />
            </CustomModal>
        </Fragment>
    )
}

Gallary.propTypes = {
    isFetchingAPI: PropTypes.bool,
    multiSelection: PropTypes.bool,
    images: PropTypes.array,
    imagesByTimeUsingLink: PropTypes.shape({
        isOpenModal: PropTypes.bool,
        originalImage: PropTypes.string,
        isLoading: PropTypes.bool,
        images: PropTypes.arrayOf(
            PropTypes.shape({
                time: PropTypes.string.isRequired,
                images: PropTypes.arrayOf(
                    PropTypes.shape({
                        ImageID: PropTypes.string.isRequired,
                        new_name: PropTypes.string,
                        event_id: PropTypes.string,
                        local_time: PropTypes.string,
                        day_of_week: PropTypes.string,
                        image_link: PropTypes.string,
                    }),
                ),
            }),
        ),
    }),
    savedImage: PropTypes.array,
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
    saveImages: PropTypes.func,
    clearImagesByTimeUsingLink: PropTypes.func,
    clearSimilarImages: PropTypes.func,
}

const mapStateToProps = (state) => ({
    isFetchingAPI: state.globalReducer.isFetchingAPI,
    imagesByTimeUsingLink: state.imageReducer.imagesByTimeUsingLink,
    savedImage: state.imageReducer.savedImage,
    similarImages: state.imageReducer.similarImages,
})

const mapDisptachToProps = (dispatch) => ({
    saveImages: (images) => dispatch(handleSaveImage(images)),
    clearImagesByTimeUsingLink: () => dispatch(handleGetImagesByTimeUsingLink([], '', false, false)),
    clearSimilarImages: () => dispatch(handleGetSimilarImages([], false)),
})

export default connect(mapStateToProps, mapDisptachToProps)(React.memo(GallaryContainer))
