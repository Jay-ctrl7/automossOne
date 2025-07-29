import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_EMAIL: '@user_email',
  USER_TYPE: '@user_type',
} as const;

type AuthData = {
  token: string | null;
  id: string | null;
  email: string | null;
  user_type: string | null;
};

export const storeAuthData = async (authData: Omit<AuthData, 'token'> & { token: string }): Promise<boolean> => {
  try {
    await AsyncStorage.multiSet([
      [AUTH_KEYS.TOKEN, authData.token],
      [AUTH_KEYS.USER_ID, authData.id],
      [AUTH_KEYS.USER_EMAIL, authData.email],
      [AUTH_KEYS.USER_TYPE, authData.user_type],
    ]);
    return true;
  } catch (error) {
    console.error('Auth storage error:', error);
    return false;
  }
};

export const getAuthData = async (): Promise<AuthData> => {
  try {
    const values = await AsyncStorage.multiGet([
      AUTH_KEYS.TOKEN,
      AUTH_KEYS.USER_ID,
      AUTH_KEYS.USER_EMAIL,
      AUTH_KEYS.USER_TYPE,
    ]);

    return {
      token: values[0][1],
      id: values[1][1],
      email: values[2][1],
      user_type: values[3][1],
    };
  } catch (error) {
    console.error('Auth retrieval error:', error);
    return {
      token: null,
      id: null,
      email: null,
      user_type: null,
    };
  }
};

export const clearAuthData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove(Object.values(AUTH_KEYS));
    return true;
  } catch (error) {
    console.error('Auth clearance error:', error);
    return false;
  };
};