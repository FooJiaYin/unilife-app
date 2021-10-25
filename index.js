import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import {Text, TextInput} from 'react-native';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

//ADD this 
if (Text.defaultProps == null) {
    Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps == null) {
    TextInput.defaultProps = {};
    TextInput.defaultProps.allowFontScaling = false;
}

import { LogBox } from 'react-native';
import _ from 'lodash';

if(LogBox) {
    LogBox.ignoreLogs(['Warning:...']); // ignore specific logs
    LogBox.ignoreAllLogs(); // ignore all logs
    const _console = _.clone(console);
    console.warn = message => {
    if (message.indexOf('Setting a timer') <= -1) {
       _console.warn(message);
       }
    };
}


registerRootComponent(App);
