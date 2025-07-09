import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'

import SearchImages from '~/components/SearchImages'
import { handleSearchConversation } from '~/redux/logics/imageLogic'
import { handleToggleModal } from '~/redux/logics/globalLogic'

function SearchImagesContainer({ conversation, searchConversation, toggleModal }) {
    const { previousChat, textualAnswer } = conversation

    const history = useMemo(
        () =>
            previousChat.map((message, index) => ({
                id: index,
                user: message,
                bot: textualAnswer[index],
            })),
        [JSON.stringify(previousChat), JSON.stringify(textualAnswer)],
    )

    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        const query = e.target.message.value

        if (!isEmpty(query.trim())) {
            e.target.message.value = ''
            searchConversation(query)
        }
    }, [])

    const handleToggleModal = useCallback(() => {
        toggleModal(true)
    }, [])

    return <SearchImages history={history} onSubmit={handleSubmit} onToggleModal={handleToggleModal} />
}

SearchImagesContainer.propTypes = {
    conversation: PropTypes.shape({
        previousChat: PropTypes.arrayOf(PropTypes.string),
        images: PropTypes.array,
        textualAnswer: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    }),
    searchConversation: PropTypes.func,
}

const mapStateToProps = (state) => ({
    conversation: state.imageReducer.conversation,
})

const mapDispatchToProps = (dispatch) => ({
    searchConversation: (query) => dispatch(handleSearchConversation(query)),
    toggleModal: (status) => dispatch(handleToggleModal(status)),
})

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SearchImagesContainer))
