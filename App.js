import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { WebView } from 'react-native-webview'

import * as Google from 'expo-google-app-auth'

// const IOS_CLIENT_ID = 'your-ios-client-id'

const ANDROID_CLIENT_ID = '395723880686-keb4n5r09p65qjobutf9i1e8p4dehg6i.apps.googleusercontent.com'

const App = () => {
  const [userSession, setUserSession] = useState(null)
  const [isStatus, setStatus] = useState('loading')
  const ref = useRef(null)
  useEffect(() => {
    const getData = async () => {
      setStatus('loading')
      try {
        const sessions = await AsyncStorage.getItem('session')
        const sessionSigs = await AsyncStorage.getItem('sessionSig')

        if (!!sessions && !!sessionSigs) {
          setUserSession({
            session: sessions,
            sessionSig: sessionSigs
          })
          setStatus('login')
        } else {
          setStatus('logout')
        }
      } catch (e) {
        alert('錯誤')
        return setStatus('logout')
      }
    }
    getData()
  }, [])

  const signInWithGoogle = async () => {
    setStatus('loading')
    const { type, accessToken, user } = await Google.logInAsync({
      androidClientId: ANDROID_CLIENT_ID
    })

    if (type !== 'success') {
      setStatus('logout')
      return alert('失败')
    }

    const u = await fetch('http://192.168.3.3:3000/api/mobile/auth/mobile-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          user: user,
          accessToken: accessToken
        }
      )
    })
      .then((response) => response.json())

    if (!u) {
      return setStatus('logout')
    }


    try {
      await Promise.all([
        AsyncStorage.setItem('session', u.session),
        AsyncStorage.setItem('sessionSig', u.sessionSig)
      ])
      setUserSession({
        session: await AsyncStorage.getItem('session'),
        sessionSig: await AsyncStorage.getItem('sessionSig')
      })
      setStatus('login')
    } catch (e) {
      return setStatus('logout')
    }
  }

  const logoutWithGoogle = async () => {
    setStatus('loading')
    try {
      await Promise.all([
        AsyncStorage.removeItem('session'),
        AsyncStorage.removeItem('sessionSig')
      ])
      setUserSession(null)
      setStatus('logout')
    } catch (e) {
      setStatus('logout')
      return alert('存儲失敗')
    }
  }

  return (
    <View style={styles.container}>

      {isStatus === 'loading' && (<ActivityIndicator size='large' />)}

      {(isStatus === 'logout' && !userSession) && (

        <WebView
          source={{ uri: 'http://192.168.3.3:3000/school/mobile/login' }}
          style={{ marginTop: 20 }}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data)
            const login = data.login
            if (login === 'google') {
              signInWithGoogle()
            } else {
              logoutWithGoogle()
            }
          }}
        />
      )}

      {(isStatus === 'login' && !!userSession) && (
        <WebView
          ref={ref}
          source={{ uri: 'http://192.168.3.3:3000/school/mobile' }}
          onLoadStart={() => (
            ref.current.injectJavaScript(`
            window.session = '${userSession.session}';
            window.sessionSig = '${userSession.sessionSig}';
            true;
            `)
          )}
          style={{ marginTop: 20 }}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data)
            const login = data.login
            if (login === 'google') {
              signInWithGoogle()
            } else {
              logoutWithGoogle()
            }
          }}
        />
      )}
      {/* {
        isLogin === 'callback' && (
          <View style={styles.container}>
            <WebView
              injectedJavaScript={`
                window.session = '${session}';
                window.sessionSig = '${sessionSig}';
                true;
              `}
              source={{ uri: testUrl }}
              onMessage={(event) => {
                let data = JSON.parse(event.nativeEvent.data)
                let login = data['login']
                if (login === 'google') {
                  signInWithGoogle()
                } else {
                  logoutWithGoogle()
                }
              }}
            />
          </View>
        )
      } */}
    </View>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',
  }
})
