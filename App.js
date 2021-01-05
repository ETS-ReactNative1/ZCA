import React, { Component } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text, Image, Alert, ActivityIndicator, Linking} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import { BackHandler } from 'react-native';

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
      url: "https://admin.dicloud.es/zca/loginverifica.asp"
    }
  } 

  async componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
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

  handleBackButton = ()=>{
    if (this.state.canGoBack) {
      this.webView.ref.goBack();
      return true;
    }
    return true;
  }

  goIndex = () => {
    this.setState({ url: "https://admin.dicloud.es/zca/index.asp" })  
    console.log("goIndex:"+this.state.url)
  }

  goHelp = () => {
    this.setState({ url: "https://admin.dicloud.es/zca/tutorial/index.html" })
  }

  saveLogout =  async (state) => {
    await AsyncStorage.setItem('lastUser', "false");
    if (!state) {
      await AsyncStorage.setItem('saveData', "false");
      this.props.navigation.push('Login');
    } else {
      await AsyncStorage.setItem('saveData', "true");
      this.props.navigation.navigate('Login');
    }
  }

  logout = async () => {
    const AsyncAlert = (title, msg) => new Promise((resolve) => {
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
      <View style={{alignItems: 'center', justifyContent: 'center', backgroundColor:"#337BB7", 
      flexDirection:'row', textAlignVertical: 'center'}}>
          <Ionicons 
            name="home" 
            onPress={this.goIndex}
            size={25} 
            color="white"
            style={styles.navBarButton}
          />
          <Text style={styles.navBarHeader}>ZCA</Text>
          <Ionicons 
            name="help-sharp" 
            onPress={this.goHelp}
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
                <View style={{ backgroundColor: "white", flex: 1, height:"100%", width: "100%", position:'absolute', justifyContent: "center", alignItems: "center" }}>
                  <Text>No hay conexión a Internet</Text>
                </View>
              );
            }
          }}
          onShouldStartLoadWithRequest={(event) => {
            if (event.url.includes("login.asp")) {
              this.logout()
              return false;
            } else if (event.url.includes("tel") || event.url.includes("mailto") || event.url.includes("maps") || event.url.includes("facebook")) {
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
         this.pass = value;
       })
       this.setState({pass:this.pass})
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

  async goHome(alias,user,pass,fullname,idempresa,token) {
    await AsyncStorage.setItem('lastUser', "true");
    await AsyncStorage.setItem('alias', alias);
    await AsyncStorage.setItem('user', user);
    await AsyncStorage.setItem('password', pass);
    await AsyncStorage.setItem('fullname', fullname);
    await AsyncStorage.setItem('idempresa', idempresa + "");
    await AsyncStorage.setItem('token', token);
    this.props.navigation.navigate('Home')
  }

  login = () => {
    let alias=this.state.alias;
    let user=this.state.user;
    let pass=this.state.pass;
    if (alias != undefined && user != undefined && pass != undefined) {
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify({aliasDb: alias, user: user, password: pass, appSource: "Disoft"})
      };
      fetch('https://app.dicloud.es/login.asp', requestOptions)
        .then((response) => response.json())
        .then((responseJson) => {
          let error = JSON.stringify(responseJson.error_code)
          if (error == 0) {
            console.log(JSON.stringify(responseJson))
            let fullname = JSON.parse(JSON.stringify(responseJson.fullName))
            let token = JSON.parse(JSON.stringify(responseJson.token))
            let idempresa = JSON.parse(JSON.stringify(responseJson.idempresa))
            this.goHome(alias,user,pass,fullname,idempresa,token)
          } else {
            this.handleError(error)
          }
        }).catch(() => {});
    } else {
      this.showAlert("Complete todos los campos")
    }
  }

  managePasswordVisibility = () => {
    this.setState({ hidePassword: !this.state.hidePassword });
  }

  goRememberPass = async () => {
    let alias=this.state.alias;
    if (alias == undefined || alias == "") {
      this.showAlert("Debe introducir su alias");
    } else {
      await AsyncStorage.setItem('alias', alias);
      this.props.navigation.navigate('Remember')
    }
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
          onChangeText={(alias) => this.setState({alias})}  
          value={this.state.alias}
        /> 
        <TextInput  
          style = { styles.textBox }
          placeholder="Usuario"  
          onChangeText={(user) => this.setState({user})}  
          value={this.state.user}
        /> 
        <View style = { styles.textBoxBtnHolder }>
          <TextInput  
            style = { styles.textBox }
            placeholder="Contraseña"
            secureTextEntry = { this.state.hidePassword }
            onChangeText={(pass) => this.setState({pass})}  
            value={this.state.pass}
          />  
          <TouchableOpacity activeOpacity = { 0.8 } style = { styles.visibilityBtn } onPress = { this.managePasswordVisibility }>
              <Ionicons name={ ( this.state.hidePassword ) ? "eye"  : "eye-off" } size={32} color="#98A406" /> 
            </TouchableOpacity>   
        </View>  
        <TouchableOpacity onPress={this.login} style={styles.appButtonContainer}>
          <Text style={styles.appButtonText}>Entrar</Text>
        </TouchableOpacity>  
        <TouchableOpacity  onPress={()=>this.goRememberPass()} style={{ margin: 30 }}>
          <Text style={{ color: "#98A406" }}>Recordar datos de acceso</Text>
        </TouchableOpacity>   
      </View>
    );
  } 
}

class RememberPass extends Component {

  idempresa = ""
  alias = ""
  webView = {
    ref: null,
  }

  constructor(props) {
    super(props);
    this.state = {}
  }

  handleBackButton = ()=>{
    this.props.navigation.navigate('Login')
    return true;
  }

  async componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    await AsyncStorage.getItem("idempresa").then((value) => {
      this.idempresa = value;
    })
    await AsyncStorage.getItem("alias").then((value) => {
      this.alias = value;
    })
    if (this.idempresa != null) {
      this.setState({ url: "https://admin.dicloud.es/zca/enviapassmail.asp?idempresa=" + this.idempresa })
    } else {
      this.setState({ url: "https://admin.dicloud.es/zca/enviapassmail.asp?alias=" + this.alias })
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
                <View style={{ backgroundColor: "white", flex: 1, height:"100%", width: "100%", position:'absolute', justifyContent: "center", alignItems: "center" }}>
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

class MainScreen extends Component {
  constructor(props) {
    super(props);
    this.init()
  }

  init = async () => {
    const lastUser = await AsyncStorage.getItem('lastUser').catch(() => {
      lastUser = "false";
    });
    if (lastUser == "true") {
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
      header: null
    }
  },
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      header: null
    }
  },
  Remember: {
    screen: RememberPass,
    navigationOptions: {
      header: null
    }
  },
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      header: null
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