import React, { Component } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

class LoginScreen extends Component {  
  constructor(props) {
    super(props);
    this.state = { hidePassword: true }
  }
  login = () => {
    alert("Entrar");
  }
  managePasswordVisibility = () => {
    this.setState({ hidePassword: !this.state.hidePassword });
  }
  render() {
    const navigation = this.props;
    return (
      <View style={ styles.container }>
        <Image
          style={{ height: 100, width: 100, margin: 10 }}
          source={require('./assets/icon.png')}
        />
        <TextInput  
          style = { styles.textBox }
          placeholder="Compañía"  
          onChangeText={(text) => this.setState({text})}  
        /> 
        <TextInput  
          style = { styles.textBox }
          placeholder="Usuario"  
          onChangeText={(text) => this.setState({text})}  
        /> 
        <View style = { styles.textBoxBtnHolder }>
          <TextInput  
            style = { styles.textBox }
            placeholder="Contraseña"
            secureTextEntry = { this.state.hidePassword }
            onChangeText={(text) => this.setState({text})}  
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

const AppNavigator = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      header: null
    }
  },
  Remember: {
    screen: RememberPass,
    navigationOptions: {
      title: "Recordar datos de acceso"
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
  }
});