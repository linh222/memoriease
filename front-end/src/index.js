import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { Slide, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Provider } from 'react-redux'

import App from './App'
import GlobalStyles from './components/GlobalStyles'
import store from './redux/store'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <>
        <Router>
            <Provider store={store}>
                <GlobalStyles>
                    <App />
                </GlobalStyles>
            </Provider>
            <ToastContainer
                position={'top-right'}
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                style={{ width: '100%', maxWidth: '30rem', marginTop: '1rem' }}
                closeButton={true}
                toastStyle={{ fontSize: 15, fontFamily: 'Segoe UI' }}
                transition={Slide}
                limit={3}
                rtl={false}
            />
        </Router>
    </>,
)
