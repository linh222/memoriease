import { combineReducers } from 'redux'

import globalReducer from './globalReducer'
import imageReducer from './imageReducer'
import requestReducer from './requestReducer'

const rootReducer = combineReducers({
    globalReducer,
    imageReducer,
    requestReducer,
})

export default rootReducer
