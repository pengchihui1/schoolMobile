import AsyncStorage from '@react-native-community/async-storage'

const getAsyncStorage = async () => {
  let data = {}
  try {
    const session = await AsyncStorage.getItem('session')
    const sessionSig = await AsyncStorage.getItem('sessionSig')

    data = {
      session,
      sessionSig
    }
  } catch (e) {
    data = {}
  }
  return data
}

export default getAsyncStorage