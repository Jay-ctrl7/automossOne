import CustomerKyc from "../component/CustomerKyc";

export const API_BASE_URL = 'https://ssdemo.in/local_automoss/automoss_api';

export const ENDPOINTS = {
    auth:{
        customerLogin: `${API_BASE_URL}/auth/customerlogin_init`,
        customerVerifyOtp: `${API_BASE_URL}/auth/customer_verifyotp`,
        Customer_Kycupdate:`${API_BASE_URL}/auth/customer_Kycupdate`,
    },
    master: {
        assessoriesList: `${API_BASE_URL}/master/products/list`,
        city: `${API_BASE_URL}/master/city`,
        category: `${API_BASE_URL}/master/category`,
        banner: `${API_BASE_URL}/master/banner`,
        packageMaster:{
            list: `${API_BASE_URL}/master/packagemaster/list`,
        }
    },

} as const;