import React from 'react';
import * as FacebookAds from 'expo-ads-facebook';
import {View,Text} from 'react-native';
import styles from './styles.js'

class FacebookNativeAd extends React.Component {
    render() {
        console.log(this.props.nativeAd)
        return (
            <View>
                <AdMediaView />
                <AdTriggerView>
                    <Text>{this.props.nativeAd.bodyText}</Text>
                </AdTriggerView>
            </View>
        );
    }
}

export default FacebookAds.withNativeAd(FacebookNativeAd)