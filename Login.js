import React, { Component } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Icon } from 'react-native-elements'
import { BackHandler } from 'react-native';

class Login extends Component {  

    constructor(props) {
      super(props);
      this.state = { idempresa:"", alias:"", user:"", password:"", fullname:"", token:"", hidePassword: true }
      this.init()
    }

    componentDidMount() {
      BackHandler.addEventListener('hardwareBackPress', this.goBack);
    }
  
    goBack = () => {
      return true
    }

    async init() {
      await AsyncStorage.getItem("saveData").then((value) => {
        if (value != null && JSON.parse(value)) this.setUserData()
      })
    }

    async setUserData() {
      await AsyncStorage.getItem("alias").then((value) => {
        if (value != null) this.setState({ alias: value })
      })
      await AsyncStorage.getItem("user").then((value) => {
        if (value != null) this.setState({ user: value })
      })
      await AsyncStorage.getItem("password").then((value) => {
        if (value != null) this.setState({ password: value })
      })
    }
  
    showAlert = (message) => {
      Alert.alert(
        "Error",
        message,[{text: "Ok",style: "cancel"},],
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
  
    async goHome() {
      await AsyncStorage.setItem('lastUser', JSON.stringify(true));
      await AsyncStorage.setItem('alias', this.state.alias);
      await AsyncStorage.setItem('user', this.state.user);
      await AsyncStorage.setItem('password', this.state.password);
      await AsyncStorage.setItem('fullname', this.state.fullname);
      await AsyncStorage.setItem('idempresa', this.state.idempresa + "");
      await AsyncStorage.setItem('token', this.state.token);
      this.props.navigation.push('Home')
    }
  
    async login(){
      if (this.state.alias.length>0 && this.state.user.length>0 && this.state.password.length>0) {
        const requestOptions = {
          method: 'POST',
          body: JSON.stringify({aliasDb: this.state.alias, user: this.state.user, password: this.state.password, appSource: "Disoft"})
        };
        fetch('https://app.dicloud.es/login.asp', requestOptions)
          .then((response) => response.json())
          .then((responseJson) => {
            let error = JSON.stringify(responseJson.error_code)
            if (error == 0) {
              this.setState({ fullname: JSON.parse(JSON.stringify(responseJson.fullName))})
              this.setState({ token: JSON.parse(JSON.stringify(responseJson.token))})
              this.setState({ idempresa: JSON.parse(JSON.stringify(responseJson.idempresa))})
              this.goHome()
            } else {
              this.handleError(error)
            }
          }).catch(() => {});
      } else await this.showAlert("Complete todos los campos")
      
    }
  
    managePasswordVisibility = () => {
      this.setState({ hidePassword: !this.state.hidePassword });
    }
  
    goRememberPass = async () => {
      await AsyncStorage.getItem("idempresa").then((value) => {
        this.state.idempresa = value;
      })
      if (this.state.idempresa == null) {
        if (this.state.alias.length==0 || this.state.user.length==0) {
          this.showAlert("Debe introducir alias y usuario");
        } else {
          await AsyncStorage.setItem('alias', this.state.alias);
          await AsyncStorage.setItem('user', this.state.user);
          this.props.navigation.push('Remember')
        }
      } else {
        this.props.navigation.push('Remember')
      }
    }

    render() {
      return (
        <View style={ styles.container }>
          <View style={{paddingBottom: 20, alignSelf:"center"}}>
          <Image
            style={{ height: 100, width: 100, margin: 10}}
            source={require('./assets/main.png')}
          />
          </View>
          <TextInput  
            style = { styles.textBox }
            placeholder="Alias"  
            placeholderTextColor="lightgray"
            onChangeText={(alias) => this.setState({alias})}  
            value={this.state.alias}
          /> 
          <TextInput  
            style = { styles.textBox }
            placeholder="Usuario"  
            placeholderTextColor="lightgray"
            onChangeText={(user) => this.setState({user})}  
            value={this.state.user}
          /> 
          <View style = { styles.textBoxBtnHolder }>
            <TextInput  
              style = { styles.textBox }
              placeholder="Contraseña"
              placeholderTextColor="lightgray"
              secureTextEntry = { this.state.hidePassword }
              onChangeText={(password) => this.setState({password})}  
              value={this.state.password}
            />  
            <TouchableOpacity activeOpacity = { 0.8 } style = { styles.visibilityBtn } onPress = { this.managePasswordVisibility }>
            <Icon 
              name={(this.state.hidePassword ) ? "eye"  : "eye-slash" }
              type='font-awesome'
              onPress={this.logout}
              size={31} 
              color="#98A406"/>
              </TouchableOpacity>   
          </View>  
          <TouchableOpacity onPress={() => this.login()} style={styles.button}>
            <Text style={styles.text}>Entrar</Text>
          </TouchableOpacity>  
          <TouchableOpacity  onPress={()=>this.goRememberPass()} style={{ margin: 30 }}>
            <Text style={{ color: "#98A406", fontWeight:"bold", fontSize:15 }}>Olvidé contaseña</Text>
          </TouchableOpacity>  
          <View style={{alignItems: 'center', justifyContent: 'center', backgroundColor:"#337BB7", flexDirection:'row', textAlignVertical: 'center'}}>
          <Text></Text>
          </View>
        </View>
      );
    } 
  }
  export default createAppContainer(Login);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center'
    },
    textBox: {
      fontSize: 18,
      alignSelf: 'stretch',
      height: 45,
      paddingLeft: 8,
      color:"black",
      borderWidth: 2,
      paddingVertical: 0,
      borderColor: '#98A406',
      borderRadius: 0,
      margin: 10,
      borderRadius: 20,
      textAlign: "center"
    },
    textBoxBtnHolder:{
      position: 'relative',
      alignSelf: 'stretch',
      justifyContent: 'center'
    },
    button: {
      elevation: 8,
      backgroundColor: "#98A406",
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 12,
      width: 150,
      margin: 20 
    },
    text: {
      fontSize: 15,
      color: "#fff",
      fontWeight: "bold",
      alignSelf: "center",
      textTransform: "uppercase"
    },
    visibilityBtn:{
      position: 'absolute',
      right: 20,
      height: 40,
      width: 35,
      padding: 2
    },
})