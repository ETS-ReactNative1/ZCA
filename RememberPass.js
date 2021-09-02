import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import { BackHandler } from 'react-native';

class RememberPass extends Component {
  
    webView={ref: null}

    constructor(props) {
      super(props);
      this.state = {
        idempresa:"", alias: "", user: ""
      }
      this.init()
    }
  
    goBack = ()=>{
      this.props.navigation.navigate('Login')
      return true;
    }
  
    async componentDidMount(){
      BackHandler.addEventListener('hardwareBackPress', this.goBack);
    }

    async init() {
        await AsyncStorage.getItem("idempresa").then((value) => {
            this.state.idempresa = value;
        })
        await AsyncStorage.getItem("alias").then((value) => {
            this.state.alias = value;
        })
        await AsyncStorage.getItem("user").then((value) => {
            this.state.user = value;
        })
        if (this.idempresa != null) {
            this.setState({ url: "https://admin.dicloud.es/zca/enviapassmail.asp?idempresa=" + this.state.idempresa })
        } else {
            this.setState({ url: "https://admin.dicloud.es/zca/enviapassmail.asp?alias=" + this.state.user.toLowerCase() + "&aliasemp=" + this.state.alias.toLowerCase() })
        }
    }
  
    render() {
      return (
        <View style={{flex: 1}}>
          <WebView
            ref={(webView) => { this.webView.ref = webView; }}
            originWhitelist={['*']}
            source={{ uri: this.state.url }}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            setSupportMultipleWindows={false}
            allowsBackForwardNavigationGestures
            onNavigationStateChange={(navState) => {
              this.setState({
                canGoBack: navState.canGoBack
              });
            }}
            onError={err => {
              this.setState({ err_code: err.nativeEvent.code })
            }}
            renderError={()=> {
              if (this.state.err_code == -2){
                return (
                  <View style={styles.noWifi}>
                    <Text>No hay conexión a Internet</Text>
                  </View>
                );
              }
            }}
          />
        </View>
      );
    }
  }
export default createAppContainer(RememberPass);

const styles = StyleSheet.create({
    noWifi: {
        backgroundColor: "white", flex: 1, height:"100%", width: "100%", position:'absolute', justifyContent: "center", alignItems: "center"
    }
})

  

  