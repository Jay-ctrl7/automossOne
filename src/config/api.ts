
export const API_BASE_URL = 'https://automoss.in/local_automoss/automoss_api';

export const ENDPOINTS = {
    auth: {
        customerLogin: `${API_BASE_URL}/auth/customerlogin_init`,
        customerVerifyOtp: `${API_BASE_URL}/auth/customer_verifyotp`,
        Customer_Kycupdate: `${API_BASE_URL}/auth/customer_Kycupdate`,
        customerinfo: `${API_BASE_URL}/auth/customerinfo`,
    },
    car: {
        savedCar: `${API_BASE_URL}/car/CustomerCar/CustomerCars`
    },
    customer: {
        jobcardInsert: `${API_BASE_URL}/customer/jobcard/insert`,
        createBookingId:`${API_BASE_URL}/customer/Servicebookings/createbooking`,
        serviceBooking: `${API_BASE_URL}/customer/Servicebookings/booking`
    },
    master: {
        assessoriesList: `${API_BASE_URL}/master/products/list`,
        city: `${API_BASE_URL}/master/city`,
        category: `${API_BASE_URL}/master/category`,
        banner: `${API_BASE_URL}/master/banner`,
        manufacture: `${API_BASE_URL}/master/manufacturer`,
        fuel: `${API_BASE_URL}/master/fuel`,
        carSize: `${API_BASE_URL}/master/carsize`,

        packageMaster: {
            list: `${API_BASE_URL}/master/packagemaster/list`,
        }
    },

} as const;