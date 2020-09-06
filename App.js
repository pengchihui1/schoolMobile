// import { StatusBar } from 'expo-status-bar'
import React, { useState, useEffect } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { WebView } from 'react-native-webview'

import * as Google from 'expo-google-app-auth'

// const IOS_CLIENT_ID = 'your-ios-client-id'

const ANDROID_CLIENT_ID = '395723880686-keb4n5r09p65qjobutf9i1e8p4dehg6i.apps.googleusercontent.com'

const App = () => {
  const [testUrl, setTestUrl] = useState('http://192.168.3.3:3000/mobile/login')
  // const [isLogin, setIsLogin] = useState('logout')
  // alert(AsyncStorage.getItem('session'))
  const [session, setSession] = useState(null)
  const [sessionSig, setSessionSig] = useState(null)
  const [isLogin, setLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      try {
        const sessions = await AsyncStorage.getItem('session')
        const sessionSigs = await AsyncStorage.getItem('sessionSig')

        if (!!sessions && !!sessionSigs) {
          setSession(sessions)
          setSessionSig(sessionSigs)
          setLogin(false)

          setTestUrl('https://school-next.macau.school/school/mobile')
          setIsLoading(false)
        } else {
          setTestUrl('https://school-next.macau.school/school/mobile/login')
          setIsLoading(false)
        }
      } catch (e) {
        alert('錯誤')
        setIsLoading(false)
        return setTestUrl('https://school-next.macau.school/school/mobile/login')
      }
    }
    getData()
  }, [])

  const signInWithGoogle = async () => {
    setIsLoading(true)
    const { type, accessToken, user } = await Google.logInAsync({
      androidClientId: ANDROID_CLIENT_ID
    })
    if (type === 'success') {
      alert('user' + user)
      const u = await fetch('https://school-next.macau.school/api/mobile/auth/mobile-login', {
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
      if (u) {
        try {
          await Promise.all([
            // AsyncStorage.setItem('session', JSON.stringify(u.session)),
            // AsyncStorage.setItem('sessionSig', JSON.stringify(u.sessionSig))
            AsyncStorage.setItem('session', u.session),
            AsyncStorage.setItem('sessionSig', u.sessionSig)
          ])
          setSession(await AsyncStorage.getItem('session'))
          setSessionSig(await AsyncStorage.getItem('sessionSig'))
          setTestUrl('https://school-next.macau.school/school/mobile')
          setIsLoading(false)
        } catch (e) {
          setIsLoading(false)
          return alert('存儲失敗')
        }
      } else {
        setIsLoading(false)
        return alert('跳转失败')
      }
    } else {
      setIsLoading(false)
      eturn alert('失败')
    }
  }

  const logoutWithGoogle = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('session'),
        AsyncStorage.removeItem('sessionSig')
      ])
      setTestUrl('https://school-next.macau.school/school/mobile/login')
    } catch (e) {
      return alert('存儲失敗')
    }
  }

  return (
    <>
      <View style={styles.container}>

        {isLoading && (<ActivityIndicator />)}

        {(!isLoading && !session && !sessionSig) && (

          <WebView
            source={{ uri: testUrl }}
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

        {(!isLoading && !isLogin && !!session && !!sessionSig) && (
          <WebView
            injectedJavaScript={`
              window.session = '${session}';
              window.sessionSig = '${sessionSig}';
              true;
              `}
            style={{ marginTop: 20 }}
            source={{ uri: testUrl }}
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
    </>
  )
}

export default App

const styles = StyleSheet.create({
        container: {
        height: '100%'
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',
  }
})
