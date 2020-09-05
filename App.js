// import { StatusBar } from 'expo-status-bar'
import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { WebView } from 'react-native-webview'

import * as Google from 'expo-google-app-auth'

// const IOS_CLIENT_ID = 'your-ios-client-id'

const ANDROID_CLIENT_ID = '395723880686-keb4n5r09p65qjobutf9i1e8p4dehg6i.apps.googleusercontent.com'

const App = () => {
  const [testUrl, setTestUrl] = useState('http://192.168.3.3:3000/mobile/login')
  const [isLogin, setIsLogin] = useState('logout')
  const [session, setSession] = useState(null)
  const [sessionSig, setSessionSig] = useState(null)

  useEffect(() => {
    const getData = async () => {
      try {
        const sessions = await AsyncStorage.getItem('session')
        const sessionSigs = await AsyncStorage.getItem('sessionSig')

        if (sessions !== null && sessionSigs !== null) {
          setSession(sessions)
          setSessionSig(sessionSigs)
          setIsLogin('login')
          setTestUrl('http://192.168.3.3:3000/mobile/login')
        } else {
          alert('se' + sessions + ' ' + sessionSigs)
          setIsLogin('logout')
          setTestUrl('http://192.168.3.3:3000/mobile/login')
        }
      } catch (e) {
        alert('錯誤')
        return setTestUrl('http://192.168.3.3:3000/mobile/login')
      }
    }
    getData()
  }, [])

  const signInWithGoogle = async () => {
    const { type, accessToken, user } = await Google.logInAsync({
      androidClientId: ANDROID_CLIENT_ID
    });
    alert(type)
    if (type === 'success') {
      let u = await fetch("http://192.168.3.3:3000/api/mobile/auth/mobile-login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            user: user,
            accessToken: accessToken
          }
        )
      })
        .then((response) => response.json())
      alert(u.session)
      if (u) {
        try {
          await Promise.all([
            // AsyncStorage.setItem('session', JSON.stringify(u.session)),
            // AsyncStorage.setItem('sessionSig', JSON.stringify(u.sessionSig))
            AsyncStorage.setItem('session', u.session),
            AsyncStorage.setItem('sessionSig', u.sessionSig)
          ])
          alert(await AsyncStorage.getItem('session'))
          setSession(await AsyncStorage.getItem('session'))
          setSessionSig(await AsyncStorage.getItem('sessionSig'))
          setIsLogin('login')
          setTestUrl('http://192.168.3.3:3000/mobile')
        } catch (e) {
          return alert('存儲失敗')
        }
      } else { return alert('跳转失败') }

    } else { return alert('失败') }
  }

  const logoutWithGoogle = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('session'),
        AsyncStorage.removeItem('sessionSig')
      ])
      setIsLogin('logout')
      setTestUrl('http://192.168.3.3:3000/mobile/login')
    } catch (e) {
      return alert('存儲失敗')
    }
  }

  return (
    <>
      {
        isLogin === 'logout' && (
          <View style={styles.container}>
            <WebView
              source={{ uri: testUrl }}
              style={{ marginTop: 20 }}
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
      }


      {
        isLogin === 'login' && (
          <View style={styles.container}>
            <WebView
              injectedJavaScript={`
                window.session = '${session}';
                window.sessionSig = '${sessionSig}';
                true;
              `}
              style={{ marginTop: 20 }}
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
      }

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
    // backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  }
})
