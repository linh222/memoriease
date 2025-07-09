import ImageByTime from '~/pages/ImageByTime'
import FilterByTimeConatiner from '~/containers/FilterByTimeContainer'
import FilterByMetadataContainer from '~/containers/FilterByMetadataContainer'
import ImageByMetadata from '~/pages/ImageByMetadata'
import Dashboard from '~/pages/Dashboard'
import Search from '~/pages/Search'
import FilterImagesContainer from '~/containers/FilterImagesContainer'
import SearchImagesContainer from '~/containers/SearchImagesContainer'
import VisualSimilarity from '~/pages/VisualSimilarity'
import SimilarityContainer from '~/containers/SimilarityContainer'
import Login from '~/pages/Login'

const routes = {
    basename: '/',
    home: '/home',
    search: '/search',
    metadata: '/metadata',
    savedScence: '/saved-scence',
    imageByTime: '/image-by-time',
    chat: '/chat',
    visualSimilarity: '/visual-similarity',
    login: '/login',
}

const unAuthorizedRoutes = [{ path: routes.login, component: Login }]
const privatedRoutes = [
    {
        path: routes.search,
        component: Dashboard,
        sidebar: FilterImagesContainer,
    },
    {
        path: routes.metadata,
        component: ImageByMetadata,
        sidebar: FilterByMetadataContainer,
    },
    {
        path: routes.imageByTime,
        component: ImageByTime,
        sidebar: FilterByTimeConatiner,
    },
    {
        path: routes.chat,
        component: Search,
        sidebar: SearchImagesContainer,
    },
    {
        path: routes.visualSimilarity,
        component: VisualSimilarity,
        sidebar: SimilarityContainer,
    },
]

export { routes, privatedRoutes, unAuthorizedRoutes }
export { default as PrivateRoutes } from './PrivateRoutes'
export { default as UnAuthorizedRoutes } from './UnAuthorizedRoutes'
