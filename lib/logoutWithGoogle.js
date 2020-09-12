import AsyncStorage from '@react-native-community/async-storage'

const logoutWithGoogle = async () => {
  // setStatus('loading')
  let logoutState = false
  try {
    await Promise.all([
      AsyncStorage.removeItem('session'),
      AsyncStorage.removeItem('sessionSig')
    ])
    // 返回这个状态就清空那边的 session
    logoutState = true
    // setUserSession(null)
    // setStatus('logout')
  } catch (e) {
    // setStatus('logout')
    // 返回这个状态就不清空那边的session
    logoutState = false
    // return alert('存儲失敗')
  }

  return logoutState
}

export default logoutWithGoogle