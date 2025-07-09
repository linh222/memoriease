import React, { Fragment } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import DefaultLayout from './layouts/DefaultLayout'
import { privatedRoutes, routes, UnAuthorizedRoutes, unAuthorizedRoutes } from './routes'
import PrivateRoutes from './routes/PrivateRoutes'
import Home from './pages/Home'

function App() {
    return (
        <Fragment>
            <Routes>
                <Route path={routes.basename} element={<Navigate to={routes.login} replace={true} />} />
                <Route element={<PrivateRoutes />}>
                    <Route path={routes.home} element={<Home />} />
                </Route>
                {privatedRoutes.map((route) => {
                    const Page = route.component
                    const Aside = route.sidebar

                    return (
                        <Route key={route.path} element={<PrivateRoutes />}>
                            <Route
                                path={route.path}
                                element={
                                    <DefaultLayout sidebar={<Aside />}>
                                        <Page />
                                    </DefaultLayout>
                                }
                            />
                        </Route>
                    )
                })}

                <Route element={<UnAuthorizedRoutes />}>
                    {unAuthorizedRoutes.map((route) => {
                        const Page = route.component

                        return <Route key={route.path} path={route.path} element={<Page />} />
                    })}
                </Route>
            </Routes>
        </Fragment>
    )
}

export default App
