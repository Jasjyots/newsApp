import React, {createContext,useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import MainContainer from './src/screens/mainContainer';

const appName = 'NEWZIO';

export const AppContext = createContext();



function App() {

  useEffect(() => {
    SplashScreen.hide();
  }, []);
  
  return (
    <AppContext.Provider value={appName}>
      <SafeAreaView >
        <MainContainer />
      </SafeAreaView>
    </AppContext.Provider>
  );
}


export default App;
