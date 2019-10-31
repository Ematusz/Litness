import React from 'react';
import styles from './styles.js'
import {View, TouchableOpacity, Text} from 'react-native';
import { Linking } from 'expo';

export default class PrivacyPolicyButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style= {styles.privacyPolicyButton}>
                 <TouchableOpacity onPress={() => Linking.openURL('https://lit-apps.com/wp-content/uploads/2019/10/Privacy-Policy.pdf')}>
                    <Text style={{color: 'black'}}>Privacy</Text>
                </TouchableOpacity>
            </View>
        );
    }
}