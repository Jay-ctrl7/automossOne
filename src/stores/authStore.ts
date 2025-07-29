import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAuthStore = create((set) => ({
  token: null,
  user: null,       // for user info object
  kycStatus: false,
  expireAt: null,
  loading: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const [tokenRes, kycRes, expireRes, userIdRes, userEmailRes, userTypeRes] = await AsyncStorage.multiGet([
        '@auth_token',
        '@kyc_status',
        '@expire_at',
        '@user_id',
        '@user_email',
        '@user_type',
      ])
      set({
        token: tokenRes[1],
        kycStatus: kycRes[1] === '1',
        expireAt: expireRes[1] ? Number(expireRes[1]) : null,
        user: {
          id: userIdRes[1],
          email: userEmailRes[1],
          type: userTypeRes[1],
        },
        loading: false,
      })
    } catch (e) {
      set({ loading: false })
      console.error('Failed to initialize auth store from AsyncStorage', e)
    }
  },

  // Store login response data in store + AsyncStorage
  storeAuthData: async (loginData) => {
    /*
    loginData example structure:
    {
      token: 'jwt-token-str',
      id: '10',
      email: 'xyzjay68@gmail.com',
      user_type: 'Customer',
      kyc_status: '1',
      expireAt: 1753797299,
      // ...other fields
    }
    */
    try {
      await AsyncStorage.multiSet([
        ['@auth_token', loginData.token],
        ['@user_id', loginData.id],
        ['@user_email', loginData.email],
        ['@user_type', loginData.user_type],
        ['@kyc_status', loginData.kyc_status],
        ['@expire_at', String(loginData.expireAt)],
      ])

      set({
        token: loginData.token,
        user: {
          id: loginData.id,
          email: loginData.email,
          type: loginData.user_type,
        },
        kycStatus: loginData.kyc_status === '1',
        expireAt: Number(loginData.expireAt),
      })
    } catch (error) {
      console.error('Failed to store auth data in AsyncStorage and store:', error)
    }
  },

  // Logout clears auth store & AsyncStorage
  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['@auth_token', '@user_id', '@user_email', '@user_type', '@kyc_status', '@expire_at'])
      set({ token: null, user: null, kycStatus: false, expireAt: null })
    } catch (error) {
      console.error('Error clearing auth data:', error)
    }
  },
}))
