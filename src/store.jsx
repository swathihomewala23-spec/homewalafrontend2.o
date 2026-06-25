import { configureStore } from '@reduxjs/toolkit'
import BasicSlice from './features/BasicSlice'

const store = configureStore({
    reducer: {
        basic: BasicSlice,

    },
})

export default store
