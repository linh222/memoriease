import React from 'react'
import { isEmpty } from 'lodash'
import { Navigate, Outlet } from 'react-router-dom'

import { routes } from '.'

function UnAuthorizedRoutes() {
    const isSignedIn = JSON.parse(localStorage.getItem('photo-exhibition-app-user'))

    if (!isEmpty(isSignedIn)) {
        return <Navigate to={routes.home} replace={true} />
    }
    return <Outlet />
}

export default UnAuthorizedRoutes
