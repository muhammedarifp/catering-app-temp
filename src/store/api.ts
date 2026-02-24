import { createApi } from '@reduxjs/toolkit/query/react'
import { getEnquiries } from '@/lib/actions/enquiries'
import { getEvents } from '@/lib/actions/events'
import { getTodos } from '@/lib/actions/todos'
import { getDishes } from '@/lib/actions/dishes'
import { getIngredients } from '@/lib/actions/ingredients'

// We define a base RTK Query API
// Since we are using Next.js Server Actions instead of normal REST routes, 
// we use `queryFn` for each endpoint to call the Server Action directly.
export const api = createApi({
    reducerPath: 'api',
    // A fake baseQuery, because we use queryFn for server actions
    baseQuery: async () => ({ data: null }),
    tagTypes: ['Enquiry', 'Event', 'Todo', 'Dish', 'Ingredient'],
    endpoints: (builder) => ({
        // Enquiries
        getEnquiries: builder.query<any, { status?: any; dateRange?: { start: Date; end: Date } } | void>({
            queryFn: async (arg) => {
                try {
                    const res = arg ? await getEnquiries(arg.status, arg.dateRange) : await getEnquiries()
                    if (res.success) return { data: res.data }
                    return { error: res.error }
                } catch (error: any) {
                    return { error: error.message }
                }
            },
            providesTags: ['Enquiry']
        }),

        // Events
        getEvents: builder.query<any, { dateRange?: { start: Date; end: Date }; status?: any; eventType?: any } | void>({
            queryFn: async (arg) => {
                try {
                    const res = arg ? await getEvents(arg.eventType, arg.status, arg.dateRange) : await getEvents()
                    if (res.success) return { data: res.data }
                    return { error: res.error }
                } catch (error: any) {
                    return { error: error.message }
                }
            },
            providesTags: ['Event']
        }),

        // Todos
        getTodos: builder.query<any, void>({
            queryFn: async () => {
                try {
                    const res = await getTodos()
                    if (res.success) return { data: res.data }
                    return { error: res.error }
                } catch (error: any) {
                    return { error: error.message }
                }
            },
            providesTags: ['Todo']
        }),

        // Dishes
        getDishes: builder.query<any, { category?: string; activeOnly?: boolean } | void>({
            queryFn: async (arg) => {
                try {
                    const res = arg ? await getDishes(arg.category, arg.activeOnly) : await getDishes()
                    if (res.success) return { data: res.data }
                    return { error: res.error }
                } catch (error: any) {
                    return { error: error.message }
                }
            },
            providesTags: ['Dish']
        }),

        // Ingredients
        getIngredients: builder.query<any, { activeOnly?: boolean } | void>({
            queryFn: async (arg) => {
                try {
                    const res = arg ? await getIngredients(arg.activeOnly) : await getIngredients()
                    if (res.success) return { data: res.data }
                    return { error: res.error }
                } catch (error: any) {
                    return { error: error.message }
                }
            },
            providesTags: ['Ingredient']
        })
    })
})

export const {
    useGetEnquiriesQuery,
    useGetEventsQuery,
    useGetTodosQuery,
    useGetDishesQuery,
    useGetIngredientsQuery
} = api
