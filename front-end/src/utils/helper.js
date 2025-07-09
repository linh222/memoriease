import { isNil } from 'lodash'
import { SIMILAR_SUBMIT, httpStatusCode, imageConstant } from './constants'

export const extractSimilarImageID = (link) => {
    const relativePath = link 
        .split(imageConstant.IMAGE_PREFIX)[1] 
        .split(imageConstant.IMAGE_EXT)[0] 
        .split('/') 

    return relativePath[2] 
}

export const getSubmitImages = (image, hasSimilarImages) => {
    const { ImageID, similar_images } = image
    // ".jpg" extention only used for "_id" or "ImageID", it's not impact link
    const submitImages = [ImageID.split('.jpg')[0]]

    if (SIMILAR_SUBMIT && hasSimilarImages) {
        const similarImages = isNil(similar_images) ? [] : similar_images
        submitImages.push(...similarImages.map((link) => extractSimilarImageID(link)))
    }

    return submitImages
}

export const resExceptionMessageHandler = (exception) => {
    if (exception.response) {
        switch (exception.response.status) {
            case httpStatusCode.FORBIDDEN:
            case httpStatusCode.UNAUTHORIZED:
                return exception.response.data?.error || `User is not authorized to perform this action`
            case httpStatusCode.NOT_FOUND:
                return exception.response.data?.error || `Not Found`
            case httpStatusCode.METHOD_NOT_ALLOWED:
                return exception.response.data?.error || 'Method not allowed'
            case httpStatusCode.BAD_REQUEST:
                return exception.response.data?.error || `Bad Request or wrong params`
            case httpStatusCode.INTERNAL_SERVER:
                return exception.response.data?.error || `Error code: 500 without message`
            default:
                return 'Unhandled status code'
        }
    }
    return 'Unhandled exception'
}
