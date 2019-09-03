import { AdMobBanner } from "expo-ads-admob";
import React from 'react';
import {TouchableOpacity,View,Text} from 'react-native';
import styles from './styles.js'

export default class AdBanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }

        this.bannerError = this.bannerError.bind(this);
    }

    bannerError() {
        console.log("Error occured")
    }
    
    render() {
        return(
            <View style = {{width: "100%", height: 100, position: 'absolute', top: 0}}> 
                <AdMobBanner
                    style={styles.adMobBanner}
                    bannerSize="largeBanner"
                    adUnitID="ca-app-pub-3940256099942544/6300978111"
                    testDeviceID="EMULATOR"
                    didFailToReceiveAdWithError={this.bannerError}
                />
            </View>
            
        )
    }
}