import { createSlice } from "@reduxjs/toolkit";

const storedCategories = JSON.parse(localStorage.getItem('categories'));

const initialState = {
    categories: storedCategories || [
        'Event Clients',
        'Vendors',
        'Corporate',
        'Executive Data',
        'Pharma',
        'Customer',
        'Other',
    ],
};

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        addCategory: (state, action) => {
            const newCategory = action.payload.trim();
            if (newCategory && !state.categories.includes(newCategory)) {
                const otherIndex = state.categories.indexOf('Other');
                state.categories.splice(otherIndex, 0, newCategory);
                localStorage.setItem('categories', JSON.stringify(state.categories)); // ✅ spelling fixed
            }
        },
    },
});

export const { addCategory } = categorySlice.actions;
export default categorySlice.reducer;
