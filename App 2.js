import React, { Component } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

class HomeScreen extends Component { 

  WEBVIEW_REF = "zca"
  alias = ""
  user = ""
  password = ""
  fullname = ""
  token = ""
  webView = {
    canGoBack: false,
    ref: null,
  }

  constructor(props) {
    super(props);
    const { navigation } = this.props
    this.state = {
      url: ""
    }
  } 

  async componentDidMount(){
    await AsyncStorage.getItem("alias").then((value) => {
      this.alias = value;
    })
    await AsyncStorage.getItem("user").then((value) => {
      this.user = value;
    })
    await AsyncStorage.getItem("password").then((value) => {
      this.password = value;
    })
    await AsyncStorage.getItem("fullname").then((value) => {
      this.fullname = value;
    })
    await AsyncStorage.getItem("token").then((value) => {
      this.token = value;
    })
    this.setState({ url: "https://admin.dicloud.es/zca/loginverifica.asp?company="+this.alias+"&user="+this.user+"&pass="+this.password })
  }

  goIndex = () => {
    this.setState({ url: "https://admin.dicloud.es/zca/index.asp" })  
  }

  goHelp = () => {
    this.setState({ url: "https://admin.dicloud.es/zca/tutorial/index.html" })
  }

  saveLogout = async (save) => {
    await AsyncStorage.setItem('lastUser', "false");
    if (save) {
      await AsyncStorage.setItem('saveData', "true");
      this.props.navigation.navigate('Login');
    } else {
      await AsyncStorage.setItem('saveData', "false");
      this.props.navigation.push('Login');
    }
  }

  logout = async () => {
    const AsyncAlert = async () => new Promise((resolve) => {
      Alert.alert(
        "Procedo a desconectar",
        "¿Mantengo su identificación actual?",
        [
          {
            text: "No",
            onPress: () => {
              resolve(this.saveLogout(false))
            },
          },
          { 
            text: "Sí", 
            onPress: () => {
              resolve(this.saveLogout(true))
          }},
          { text: "Cancelar", 
          onPress: () => {
            resolve()
        },
        style: "cancel"
      }],
        { cancelable: false }
      );
    });
    await AsyncAlert();
  }

  print = async (url) => {
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      FileSystem.documentDirectory + 'impresion.pdf',
      {},
    );
    const { uri } = await downloadResumable.downloadAsync();
    Print.printAsync({ uri: uri })
  }

  onBack() {
    if (this.state.canGoBack) {
      this.webView.ref.goBack();
      return true;
    } else {
      this.setState({ url: "https://admin.dicloud.es/zca/loginverifica.asp?company="+this.alias+"&user="+this.user+"&pass="+this.password })
    }
  }

  render(){
    return(
      <View style={{flex: 1}}>
      <View style={{alignItems: 'center', justifyContent: 'center', backgroundColor:"#337BB7", flexDirection:'row', textAlignVertical: 'center'}}>
        <Ionicons 
            name="arrow-back" 
            onPress={this.onBack.bind(this)}
            size={35} 
            color="white"
            style={styles.navBarButton}
          />
          <Ionicons 
            name=""
            size={35} 
            color="white"
            style={styles.navBarButton}
          />
          <Text style={styles.navBarHeader}>ZCA</Text>
          <Ionicons 
            name="help-sharp" 
            onPress={this.goHelp}
            size={35} 
            color="white"
            style={styles.navBarButton}
          />
          <Ionicons 
            name="home" 
            onPress={this.goIndex}
            size={30} 
            color="white"
            style={styles.navBarButton}
          />
        </View>
        <WebView
          ref={(webView) => { this.webView.ref = webView; }}
          originWhitelist={['*']}
          source={{ uri: this.state.url }}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          setSupportMultipleWindows={false}
          allowsBackForwardNavigationGestures
          allowUniversalAccessFromFileURLs
          onNavigationStateChange={(navState) => {
            this.setState({
              canGoBack: navState.canGoBack
            });
          }}
          onShouldStartLoadWithRequest={(event) => {
            if (event.url.includes("login.asp")) {
              this.logout()
              return false;
            } else if (event.url.includes("tel") || event.url.includes("mailto") || event.url.includes("maps")) {
              Linking.canOpenURL(event.url).then((value) => {
                if (value) {
                  Linking.openURL(event.url)
                }
              })
              return false
            } else if (event.url.includes("facebook")) {
              Linking.canOpenURL(event.url).then((value) => {
                if (value) {
                  Linking.openURL(event.url)
                }
              }) 
              return false
            } /*else if (event.url.includes("impresionqr")) {
              this.print(event.url)
              return false
            }*/ else {
              console.log(event.url)
              this.setState({ url: event.url })
              return true
            }
          }}
        />
    </View>
    )
  }
}

class LoginScreen extends Component {  
  constructor(props) {
    super(props);
    this.state = { hidePassword: true }
  }

  async componentDidMount(){
    const saveData = await AsyncStorage.getItem('saveData').catch(() => {
      saveData = "false";
    });
    if (saveData == "true") {
      await AsyncStorage.getItem("alias").then((value) => {
        this.alias = value;
      })
      this.setState({alias:this.alias})
      await AsyncStorage.getItem("user").then((value) => {
        this.user = value;
      })
      this.setState({user:this.user})
      await AsyncStorage.getItem("password").then((value) => {
        this.password = value;
      })
      this.setState({password:this.password})
    }
  }

  showAlert = (message) => {
    Alert.alert(
      "Error",
      message,
      [
        {
          text: "Ok",
          style: "cancel"
        },
      ],
      { cancelable: false }
    );
  }

  handleError = (error_code) => {
    var error = ""
    switch(error_code) {
      case "1":
        error = "Alias incorrecto"
        break;
      
      case "2":
        error = "Usuario o contraseña incorrectas"
        break;
 
      case "3":
        error = "Este usuario se encuentra desactivado"
        break;
 
      case "4":
        error = "Ha habido algún problema en la comunicación"
        break;
 
      case "5":
        error = "No hay conexión a internet"
        break;

      default:
        error = "Error desconocido"
      }
      this.showAlert(error);
  }

  async goHome(alias,user,password,fullname,token) {
    await AsyncStorage.setItem('lastUser', "true");
    await AsyncStorage.setItem('alias', alias);
    await AsyncStorage.setItem('user', user);
    await AsyncStorage.setItem('password', password);
    await AsyncStorage.setItem('fullname', fullname);
    await AsyncStorage.setItem('token', token);
    this.props.navigation.navigate('Home')
  }

  login = () => {
    let alias=this.state.alias;
    let user=this.state.user;
    let password=this.state.password;
    if (alias != undefined && user != undefined && password != undefined) {
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify({aliasDb: alias, user: user, password: password, appSource: "Disoft"})
      };
      fetch('https://app.dicloud.es/login.asp', requestOptions)
        .then((response) => response.json())
        .then((responseJson) => {
          let error = JSON.stringify(responseJson.error_code)
          if (error == 0) {
            let fullname = JSON.parse(JSON.stringify(responseJson.fullName))
            let token = JSON.parse(JSON.stringify(responseJson.token))
            this.goHome(alias,user,password,fullname,token)
          } else {
            this.handleError(error)
          }
        })
        .catch(() => {});
    } else {
      this.showAlert("Complete todos los campos")
    }
  }

  managePasswordVisibility = () => {
    this.setState({ hidePassword: !this.state.hidePassword });
  }
  
  render() {
    return (
      <View style={ styles.container }>
        <Image
          style={{ height: 100, width: 100, margin: 10 }}
          source={require('./assets/icon.png')}
        />
        <TextInput  
          style = { styles.textBox }
          placeholder="Alias"
          value={this.state.alias}
          onChangeText={(alias) => this.setState({alias})}  
        /> 
        <TextInput  
          style = { styles.textBox }
          placeholder="Usuario"  
          value={this.state.user}
          onChangeText={(user) => this.setState({user})}  
        /> 
        <View style = { styles.textBoxBtnHolder }>
          <TextInput  
            style = { styles.textBox }
            placeholder="Contraseña"
            value={this.state.password}
            secureTextEntry = { this.state.hidePassword }
            onChangeText={(password) => this.setState({password})}  
          />  
          <TouchableOpacity activeOpacity = { 0.8 } style = { styles.visibilityBtn } onPress = { this.managePasswordVisibility }>
              <Ionicons name={ ( this.state.hidePassword ) ? "eye"  : "eye-off" } size={32} color="#98A406" /> 
            </TouchableOpacity>   
        </View>  
        <TouchableOpacity onPress={this.login} style={styles.appButtonContainer}>
          <Text style={styles.appButtonText}>Entrar</Text>
        </TouchableOpacity>  
        <TouchableOpacity  onPress={()=>this.props.navigation.navigate('Remember')} style={{ margin: 30 }}>
          <Text style={{ color: "#98A406" }}>Recordar datos de acceso</Text>
        </TouchableOpacity>   
      </View>
    );
  } 
}

class RememberPass extends Component {
  sendMail = () => {
    alert("Enviar correo");
  }
  render() {
    return (
      <View style={ styles.container }>
          <Text>Indique el correo de la empresa</Text>
          <Text style={{margin:20}}>para obtener los datos de acceso a la plataforma</Text>
          <TextInput  
            style = { styles.textBox }
            placeholder="Correo"  
            onChangeText={(text) => this.setState({text})}  
          /> 
          <TouchableOpacity onPress={this.sendMail} style={styles.appButtonContainer}>
          <Text style={styles.appButtonText}>Enviar</Text>
        </TouchableOpacity>  
      </View>
    );
  }
}

class MainScreen extends Component {
  lastUser = "false";

  constructor(props) {
    super(props);
    this.init()
  }

  init = async () => {
    await AsyncStorage.getItem('lastUser').then((value) => {
      this.lastUser = value;
    })
    if (this.lastUser == "true") {
      this.props.navigation.navigate('Home')
    } else {
      this.props.navigation.navigate('Login')
    }
  };

  render(){
    return (
      <View style={styles.container}>
      <ActivityIndicator
        color='#98A406'
        size='large'
        style={styles.container}
      />
    </View>
    )
  }
}

const AppNavigator = createStackNavigator({
  Main: {
    screen: MainScreen,
    navigationOptions: {
      headerShown: false
    }
  },
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      headerShown: false
    }
  },
  Remember: {
    screen: RememberPass,
    navigationOptions: {
      title: "Recordar datos de acceso",
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      }
    },
  },
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerShown: false
    }
  },
});

export default createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBoxBtnHolder:{
    position: 'relative',
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  textBox: {
    fontSize: 18,
    alignSelf: 'stretch',
    height: 45,
    paddingLeft: 8,
    color:"#98A406",
    borderWidth: 2,
    paddingVertical: 0,
    borderColor: '#98A406',
    borderRadius: 0,
    margin: 10,
    borderRadius: 20,
    textAlign: "center"
  },
  visibilityBtn:{
    position: 'absolute',
    right: 20,
    height: 40,
    width: 35,
    padding: 2
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#98A406",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: 150,
    margin: 20 
  },
  appButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  },
  navBarButton: {
    color: '#FFFFFF',
    textAlign:'center',
    width: 64
  },
  navBarHeader: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20
  },
});