import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    viewType: 'List',
    isModalOpen: false,
    isNavbarModalOpen: "",
    propertiesList: [],
    filter: {
        categoryId: null,
        property_area: [],
        min_price: 500000,
        max_price: 100000000,
        beds: [],
        area_min: 500,
        area_max: 5000,
        construction_status: [],
        furnished_status: [],
        city: [],
        state: [],
        country: [],
        search: [],
        isAlreadySeen: false,
        properyType: '',
        isFavourites: true,
        paginate:1

    },
    user: {

    }


}

const BasicSlice = createSlice({
    name: 'basic',
    initialState,
    reducers: {
        setToggleView(state, action) {
            state.viewType = action.payload
        },
        setIsModalOpen(state, action) {
            state.isModalOpen = action.payload
        },
        setIsNavbarModalOpen(state, action) {
            state.isNavbarModalOpen = action.payload
        },
        setFilterdData(state, action) {
            state.filter = action.payload
        },
        setPropertiesList(state, action) {
            state.propertiesList = action.payload
        },
        setUser(state, action) {
            state.user = action.payload
        },
    }
})

export const { setUser, setToggleView, setIsModalOpen, setPropertiesList, setIsNavbarModalOpen, setFilterdData } = BasicSlice.actions

export default BasicSlice.reducer