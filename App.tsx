import React from 'react';
import {View, Button} from 'react-native';
import {w3cIssuanceFlow} from './src/flow';

const App = () => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button title="W3C JSON Flow" onPress={w3cIssuanceFlow} />
    </View>
  );
};

export default App;
