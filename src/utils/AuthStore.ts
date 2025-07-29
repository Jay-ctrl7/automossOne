import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeAuthData= async(authData) => {
    try {
        
        await AsyncStorage.multiSet([
            ['@auth_token',authData.token],
            ['@user_id',authData.id],
            ['@user_email',authData.email],
            ['@user_type',authData.user_type]
        ]);
    } catch (error) {
        console.error("Error storing auth data:", error);
    }
}

export const getAuthData = async () => {
    try {
        const [
            authToken,
            userId,
            userEmail,
            userType
        ] = await AsyncStorage.multiGet([
            '@auth_token',
            '@user_id',
            '@user_email',
            '@user_type'
        ]);
        return {
            token: authToken[1],
            id: userId[1],
            email: userEmail[1],
            user_type: userType[1]
        };
    } catch (error) {
        console.error("Error retrieving auth data:", error);
    }
}

export  const clearAuthData=async()=>{
    try{
        await AsyncStorage.multiRemove([
            '@auth_token',
            '@user_id',
            '@user_email',
            '@user_type'
        ]);
    } catch (error) {
        console.error("Error clearing auth data:", error);
    }
}