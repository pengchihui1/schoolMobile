import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView, ActivityIndicator, StyleSheet, Text, View, Alert } from 'react-native'
import NetInfo, { useNetInfo } from '@react-native-community/netinfo'
import { WebView } from 'react-native-webview'

import logoutWithGoogle from './lib/logoutWithGoogle'
import signInWithGoogle from './lib/signInWithGoogle'
import getAsyncStorage from './lib/getAsyncStorage'

import url from './url'

const App = () => {
  const ref = useRef(null)
  const netInfo = useNetInfo()
  const [userSession, setUserSession] = useState(null)
  const [isStatus, setStatus] = useState('loading')
  const [isNetInfo, setIsNetInfo] = useState(null)

  useEffect(() => {
    setStatus('loading')
    const getData = async () => {
      const data = await getAsyncStorage()
      let result = 'logout'
      if (!!data.session && !!data.sessionSig) {
        setUserSession({ ...data })
        result = 'login'
      } else {
        result = 'logout'
      }

      setStatus(result)
    }

    getData()
  }, [])

  useEffect(() => {
    const networkState = netInfo.isConnected
    setIsNetInfo(networkState)
  }, [netInfo])

  // 登入
  const signIn = async () => {
    setStatus('loading')
    const signInData = await signInWithGoogle()
    let result = 'logout'
    if (signInData) {
      setUserSession(signInData)
      result = 'login'
    } else {
      result = 'logout'
    }
    setStatus(result)
  }

  // 登出
  const logout = async () => {
    setStatus('loading')
    const state = await logoutWithGoogle()
    if (state) { setUserSession(null) }

    setStatus('logout')
  }

  return (
    <>
      <View style={styles.container}>
        {!isNetInfo && (<NetworkTip />)}
        {isNetInfo && (
          <>
            {isStatus === 'loading' && (<ActivityIndicator size='large' />)}

            {(isStatus === 'logout' && !userSession) && (
              <WebView
                source={{ uri: url.login }}
                onMessage={(event) => {
                  const data = JSON.parse(event.nativeEvent.data)
                  const login = data.login
                  login === 'google' ? signIn() : logout()
                }}
                onContentProcessDidTerminate={syntheticEvent => {
                  // 重新启动网络时会刷新
                  this.refs.webview.reload();
                }}
              />
            )}

            {(isStatus === 'login' && !!userSession) && (
              <WebView
                ref={ref}
                source={{ uri: url.home }}
                onLoadStart={() => (
                  ref.current.injectJavaScript(`
                      window.session = '${userSession.session}';
                      window.sessionSig = '${userSession.sessionSig}';
                      window.test = ${useNetInfo};
                      true;
                    `)
                )}
                onContentProcessDidTerminate={syntheticEvent => {
                  // 重新启动网络时会刷新
                  this.refs.webview.reload();
                }}
                onMessage={(event) => {
                  const data = JSON.parse(event.nativeEvent.data)
                  const login = data.login
                  login === 'google' ? signIn() : logout()
                }}
              />
            )}
          </>
        )}
      </View>
    </>
  )
}

const NetworkTip = () => {
  return (
    // <SafeAreaView>
    //   <Text
    //     style={styles.text}
    //   >
    //     No Internet Connection
    //   </Text>
    // </SafeAreaView>

    <View style={styles.container2}>
      <Text
        style={{
          color: 'white',
          padding: 30,
          textAlign: 'center',
          letterSpacing: 2,
          fontSize: 16
        }}
      >
        没有网，请重新连接
      </Text>
    </View>

  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  container2: {
    flex: 2,
    height: '100%',
    zIndex: 212123,
    backgroundColor: '#fff',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  networkContainer: {
    position: 'relative',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    height: '90%',
    width: '100%',
    zIndex: 1222,
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  text: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: 30,
    textAlign: 'center',
    letterSpacing: 2,
    fontSize: 16
  }
})
