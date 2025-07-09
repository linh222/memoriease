import { fetchingAPI, toggleModal } from '~/redux/actions/globalAction'

export const handleFetchingAPI = (status) => (dispatch) => dispatch(fetchingAPI(status))
export const handleToggleModal = (status) => (dispatch) => dispatch(toggleModal(status))
