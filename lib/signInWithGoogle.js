import AsyncStorage from '@react-native-community/async-storage'
import * as Google from 'expo-google-app-auth'
const ANDROID_CLIENT_ID = '395723880686-keb4n5r09p65qjobutf9i1e8p4dehg6i.apps.googleusercontent.com'
// const IOS_CLIENT_ID = 'your-ios-client-id'

const signInWithGoogle = async () => {
  let loginState = null

  const { type, accessToken, user: googleUser } = await Google.logInAsync({
    androidClientId: ANDROID_CLIENT_ID
  })

  // 登录失败返回 null 值
  if (type !== 'success') { return loginState }

  const user = await fetch(
    'http://192.168.3.3:3000/api/mobile/auth/mobile-login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          user: googleUser,
          accessToken: accessToken
        }
      )
    })
    .then((response) => response.json())
    .catch(error => {
      Alert.alert('Sorry,sometging went wrong.', error.message)
    })
  // .finally(() => {
  //   // setStatus('logout')
  // })

  if (!user) {
    // 登录失败返回 null 值
    return loginState
  }


  try {
    await Promise.all([
      AsyncStorage.setItem('session', user.session),
      AsyncStorage.setItem('sessionSig', user.sessionSig)
    ])
    // 储存成功赋值
    loginState = {
      session: await AsyncStorage.getItem('session'),
      sessionSig: await AsyncStorage.getItem('sessionSig')
    }
  } catch (e) {
    // 储存失败 null 值
    loginState = null
  }
  // 有对象就表示登录成功了
  return loginState
}

export default signInWithGoogle