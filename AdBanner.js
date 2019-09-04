import { AdMobBanner } from "expo-ads-admob";
import React from 'react';
import {TouchableOpacity,View,Text} from 'react-native';
import styles from './styles.js'
import Dimensions from 'Dimensions';

export default class AdBanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bannerHeight: 100,
            bannerType: "largeBanner"
        }

        this.bannerError = this.bannerError.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount() {
        if (Dimensions.get('window').height*.14 < 100) {
            this.setState({bannerHeight: 50})
            this.setState({bannerType: "banner"})
        }
    }

    bannerError() {
        console.log("Error occured")
    }
    
    render() {
        return(
            <View style = {{width: "100%", height: this.state.bannerHeight, position: 'absolute', top: 0}}> 
                <AdMobBanner
                    style={styles.adMobBanner}
                    bannerSize={this.state.bannerType}
                    adUnitID="ca-app-pub-3940256099942544/6300978111"
                    testDeviceID="EMULATOR"
                    didFailToReceiveAdWithError={this.bannerError}
                />
            </View>
            
        )
    }
}