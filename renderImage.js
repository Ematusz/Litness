import React from 'react';
import {Image} from 'react-native';
import styles from './styles.js'

export function renderMarkerIcon(count) { 
    if (count < 0) {
        return <Image
                style = {styles.emojiIcon}
                source={{uri:"https://media.giphy.com/media/WnNzIz5cTKYyVcVZxM/giphy.gif"}}
                />;
    } else if(count < 3) {
        return <Image
                style = {{...styles.emojiIcon}}
                source={require('./assets/logs.png')}
                />;
    } else if (count < 5) {
        return <Image
                style = {styles.emojiIcon}
                source={{uri:"https://media.giphy.com/media/MFyEVDtwt0gaQ0MGmm/giphy.gif"}}
                />;
    } else if (count < 10) {
        return <Image
                style = {{...styles.emojiIcon}}
                source={{uri:"https://media.giphy.com/media/ZBQruf89fJy4hLvrsu/giphy.gif"}}
                />;
    } else {
        return <Image
                style = {{...styles.emojiIcon}}
                source={{uri:"https://media.giphy.com/media/VdiViln8zZB2WdYcmR/giphy.gif"}}
                />;
    } 
}

export function renderGhostIcon() { 
    return  <Image
            style = {styles.emojiIcon}
            source={require('./assets/poo2.png')}
            />
}

export function renderLoadingFire() {
    return <Image
            style = {{...styles.emojiIcon,backgroundColor:"white",borderWidth:0, alignSelf:'center'}}
            source={{uri:"https://media.giphy.com/media/MFyEVDtwt0gaQ0MGmm/giphy.gif"}}
            />
}

export function renderRefresh() {
    return <Image
            style = {{flex:1,
                    height: 15,
                    resizeMode: 'contain',
                    width: 15,
                    alignSelf: 'center'}}
            source={require('./assets/refresh.png')}
            />
}

export function renderVotingLit() {
    return <Image
            style = {{
                height: 40,
                resizeMode: 'contain',
                width: 35,}}
            source={require('./assets/fire.png')}
            />
}

export function renderVotingShit() {
    return <Image
            style = {{
                height: 40,
                resizeMode: 'contain',
                width: 30,}}
            source={require('./assets/poop.png')}
            />
}

export function renderNavigationIcon() {
        return <Image
                style = {{
                        height: 40,
                        resizeMode: 'contain',
                        width: 30,}}
                // this is a place holder. Make sure to find something open source or make our own
                source={require('./assets/navigation.png')}
                />
}

export function renderAddMarkerIcon() {
    return  <Image
            style = {{flex:1,
                    height: 30,
                    resizeMode: 'contain',
                    width: 30,}}
            source={require('./assets/insertMarker.png')}
            />
}

export function renderLeaderboardTabIcon() {
    return <Image
            style = {{flex:1,
                    height: 30,
                    resizeMode: 'contain',
                    width: 30,}}
            source={require('./assets/medal.png')}
            />
}

export function renderRefreshPositionTabIcon() {
        return <Image
                style = {{flex:1,
                        height: 30,
                        resizeMode: 'contain',
                        width: 30,}}
                        // this is a place holder. Make sure to find something open source or make our own
                source={require('./assets/refreshButton.png')}
                />
}

export function renderLandmark() {
    return <Image
            style = {{
                    margin:2,
                    height: 50,
                    resizeMode: 'contain',
                    width: 50,                                    
                    }}
            source={require('./assets/landmark.png')}
            />
}