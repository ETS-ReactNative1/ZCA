
import React, { Component } from 'react';
import { StyleSheet, View, Text, Alert, Linking } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import { BackHandler } from 'react-native';
import { Icon } from 'react-native-elements'

class Home extends Component { 

    WEBVIEW_REF = "zca"
    webView = { canGoBack: false, ref: null }
  
    constructor(props) {
      super(props);
      this.state = {
        alias: "",
        user: "",
        password: "",
        fullname: "",
        token:"",
        idempresa: "",
        url: ""
      }
      this.init()
    } 

    async init() {
      await AsyncStorage.getItem("alias").then((value) => {
        if (value != null) {
          this.setState({ alias: value })
        }
      })
      await AsyncStorage.getItem("user").then((value) => {
        if (value != null) {
          this.setState({ user: value })
        }
      })
      await AsyncStorage.getItem("password").then((value) => {
        if (value != null) {
          this.setState({ password: value })
        }
      })
      await AsyncStorage.getItem("idempresa").then((value) => {
        if (value != null) {
          this.setState({ idempresa: value })
        }
      })
      this.setState({ url: "https://admin.dicloud.es/zca/loginverifica.asp?company="+this.state.alias+"&user="+this.state.user+"&pass="+this.state.password.toUpperCase()+"&idempresa="+this.state.idempresa+"&movil=si" })
    }
  
    componentDidMount() {
      BackHandler.addEventListener('hardwareBackPress', this.goBack);
   }
  
   goBack = () => {
      if (this.state.canGoBack) {
        this.webView.ref.goBack()
      }
      return true
    }
  
    goIndex = () => {
      this.setState({ url: "https://admin.dicloud.es/zca/loginverifica.asp?company="+this.state.alias+"&user="+this.state.user+"&pass="+this.state.password.toUpperCase()+"&idempresa="+this.state.idempresa+"&movil=si" })
    }
  
    goHelp = () => {
      this.setState({ url: "https://admin.dicloud.es/zca/tutorial/index.html" })
    }
  
    saveLogout =  async (state) => {
      await AsyncStorage.setItem('lastUser', JSON.stringify(false))
      await AsyncStorage.setItem('saveData', JSON.stringify(JSON.parse(state)))
      this.props.navigation.push('Login')
    }
  
    logout = async () => {
      const AsyncAlert = () => new Promise((resolve) => {
        Alert.alert(
          "Procedo a desconectar",
          "¿Mantengo tu identificación actual?",
          [
            {
              text: 'Sí',
              onPress: () => {
                resolve(this.saveLogout(true));
              },
            },
            {
              text: 'No',
              onPress: () => {
                resolve(this.saveLogout(false));
              },
            },
            {
              text: 'Cancelar',
              onPress: () => {
                resolve('Cancel');
              },
            },
          ],
          { cancelable: false },
        );
      });
      await AsyncAlert();
    }

    render(){
      return(
        <View style={{flex: 1}}>
          <WebView
            ref={(webView) => { this.webView.ref = webView; }}
            originWhitelist={['http://*', 'https://*' ]}
            source={{ uri: this.state.url }}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            setSupportMultipleWindows={false}
            allowsBackForwardNavigationGestures
            onNavigationStateChange={(navState) => {
              var canGoBack = true
              if (navState.url == "https://admin.dicloud.es/zca/index.asp") {
                canGoBack = false
              }
              this.setState({
                canGoBack: canGoBack
              })
            }}
            onError={err => {
              this.setState({ err_code: err.nativeEvent.code })
            }}
            renderError={()=> {
              if (this.state.err_code == -2){
                return (
                  <View style={{ backgroundColor: "white", flex: 1, height:"100%", width: "100%", position:'absolute', justifyContent: "center", alignItems: "center" }}>
                    <Text>No hay conexión a Internet</Text>
                  </View>
                );
              }
            }}
            onShouldStartLoadWithRequest={(event) => {
              if (!event.url.includes("about:blank") && !event.url.includes("recaptcha") ) {
                if (event.url == "https://admin.dicloud.es/zca/login.asp?idempresa=") {
                  this.logout()
                  return false
                } else if (event.url.includes("drive") || event.url.includes("tel:") || event.url.includes("mailto:") || event.url.includes("maps") || event.url.includes("facebook")) {
                  Linking.canOpenURL(event.url).then((value) => {
                    if (value) {
                      Linking.openURL(event.url)
                    }
                  })
                  return false
                } else {
                  this.setState({ url: event.url })  
                  return true
                } 
              }
            }}
          />
          <View style={styles.navBar}>
          <Icon 
              name="sign-out" 
              type='font-awesome'
              onPress={this.logout}
              size={35} 
              color="white"
              style={styles.navBarButton}
            />
            <Icon 
              name="home" 
              type='font-awesome'
              size={35} 
              color="#1C538E"
              style={styles.navBarButton}
            />
            <Icon 
              name="home" 
              type='font-awesome'
              onPress={this.goIndex}
              size={35} 
              color="white"
              style={styles.navBarButton}
            />
            <Icon 
              name="home" 
              type='font-awesome'
              size={35} 
              color="#1C538E"
              style={styles.navBarButton}
            />
            <Icon 
              name="info" 
              type='font-awesome'
              onPress={this.goHelp}
              size={35} 
              color="white"
              style={styles.navBarButton}
            />
          </View>
      </View>
      )
    }
  }

  export default createAppContainer(Home);

  const styles = StyleSheet.create({
    navBar:{
      flexDirection:'row', 
      textAlignVertical: 'center',
      height: 50,
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor:"#1C538E", 
      flexDirection:'row', 
      textAlignVertical: 'center'
    },
    navBarHeader: {
      flex: 1,
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 20
    },
    navBarButton: {
      color: '#FFFFFF',
      textAlign:'center',
      width: 60
    },
  })