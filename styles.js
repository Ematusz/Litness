import { StyleSheet, Platform } from 'react-native';
import Dimensions from 'Dimensions';
export default StyleSheet.create({
  addHubButton: {
    backgroundColor:"white",
    borderColor:'black',
    borderBottomWidth: Dimensions.get('window').height*.0027,
    right: "-.75%",
  }, 
  adMobBanner: {
    alignSelf: "center"
  },
  bigContainer: {
    flex:1,
    flexDirection: 'column',
    justifyContent:'flex-start',
  },
  clearSearh: {
    margin:2,
    height: Dimensions.get('window').height*.0204,
    resizeMode: 'contain',
    width: Dimensions.get('window').height*.0204, 
    color: 'red',
    fontWeight: 'bold'  
  },
  closeBar: {
    backgroundColor: 'red',
    justifyContent:'center',
    alignItems:'center',
    width: Dimensions.get('window').height*.040,
    height: Dimensions.get('window').height*.040,
    borderRadius: Dimensions.get('window').height*.0679,
    position: 'absolute',
    left: ".5%",
    top: ".5%"
  }, 
  container: {
    justifyContent: 'center',
    flex:1
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5fcff"
  },
  emojiIcon: {
    height:Dimensions.get('window').width*0.0966,
    width: Dimensions.get('window').width*0.0966,
    resizeMode: 'contain',
  },
  errorBanner: {
    height: '10%',
    width: '90%',
    top:"3.5%",
    alignSelf:'center',
    position: 'absolute',
    borderColor:'black',
    borderWidth: Dimensions.get('window').height*.00272,
    borderRadius: Dimensions.get('window').height*.0204,
    backgroundColor: 'white',
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    zIndex: 3
  },
  errorPage: {
    marginLeft:'10%',
    marginRight:'10%',
    flex:1,
    alignContent: 'center',
    backgroundColor: 'white',
    justifyContent:'center',
    alignItems:'center',
  },
  flatListContainer: {
    flex: 1,
    width: '95%',
  },
  ghostMarker: {
    borderWidth: Dimensions.get('window').height*.00272,
    borderColor: "transparent",
    position: Platform.OS !== 'ios' ? 'relative' : 'absolute',
    alignItems:'center',
    justifyContent:'center',
  },        
  infoPage: {
    height: '90%',
    width: '90%',
    position: 'absolute',
    top:"5%",
    alignSelf:'center',
    borderColor:'black',
    borderWidth: Dimensions.get('window').height*.00272,
    borderRadius: Dimensions.get('window').height*.0204,
    backgroundColor: 'white',
    flex:1,
    flexDirection:'column',
    justifyContent:'flex-start',
    alignItems:'center',
    zIndex:2
  },
  infoPageIcons: {
    height: Dimensions.get('window').height*.0272,
    resizeMode: 'contain',
    width: Dimensions.get('window').width*.0483,
    backgroundColor:'white'
  },
  LBinnerBox: {
    height:Dimensions.get('window').width*0.0725,
    width: Dimensions.get('window').width*0.0725,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right:".75%",
    backgroundColor:"white",
  },
  leaderboard: {
    height: '90%',
    width: '90%',
    position: 'absolute',
    top: "5%",
    alignSelf:'center',
    borderColor:'black',
    borderWidth: Dimensions.get('window').height*.00272,
    borderRadius: Dimensions.get('window').height*.0204,
    backgroundColor: 'white',
    flex:1,
    flexDirection:'column',
    justifyContent:'flex-start',
    alignItems:'center',
    zIndex:0
  },
  leaderboardButton: {
    backgroundColor:"white",
    borderColor:'black',
    borderBottomWidth: Dimensions.get('window').height*.0027,
    flex:1,
    right: "-.75%",
  },
  leaderBoardCell: {
    marginTop: "1.5%",
    display:"flex",
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: 0,
    backgroundColor:'white'
  },
  leaderboardText: {
    fontSize: Dimensions.get('window').width*0.0483,
  },
  loading: {
    position: 'absolute',
    right: ".5%",
    top:".5%",
    backgroundColor: '#007AFF',
    borderRadius: Dimensions.get('window').height*.0679,
    width: Dimensions.get('window').height*.0408,
    height: Dimensions.get('window').height*.0408,
    justifyContent:'center'
  },
  locationText: {
    marginTop:(Platform.OS === 'ios' ? Dimensions.get('window').height*.0136 : 0),
    alignSelf: 'center',
    display:'flex',
    justifyContent:'space-evenly',
    flexDirection:"row"
  },
  marker: {
    height:Dimensions.get('window').width*0.0966,
    width: Dimensions.get('window').width*0.0966,
    alignItems:'center',
    justifyContent:'center',
    position: Platform.OS !== 'ios' ? 'relative' : 'absolute'
  },
  markerCost: {
      color: "white",
      fontWeight: "bold",
      fontSize: Dimensions.get('window').width*0.0386,
      position: 'absolute',
  },
  parentButtonTab: {
    position: 'absolute',
    top: '14%',
    display:'flex',
    borderWidth: Dimensions.get('window').height*.0027,
    flexDirection:'column',
    justifyContent:'flex-start'
  },
  privacyPolicyButton: {
    position: 'absolute',
    bottom: Dimensions.get('window').height*.01,
    right: '2%',
    backgroundColor: 'transparent',
  },
  refresh: {
    position: 'absolute',
    right: ".5%",
    top:".5%",
    backgroundColor: '#007AFF',
    borderRadius: Dimensions.get('window').height*.0679,
    width: Dimensions.get('window').height*.0408,
    height: Dimensions.get('window').height*.0408,
    justifyContent:'center'
  }, 
  tab: {
    backgroundColor:"white",
    borderColor:'black',
    borderWidth: Dimensions.get('window').height*.0027,
    position: 'absolute',
    flex:1,
    top: '40%',
    flexDirection:'column',
    justifyContent: 'space-evenly',
    alignItems:"center",
  },
  tabStyle: {
    backgroundColor: 'white',
    borderRadius: Dimensions.get('window').height*.00679,
    borderWidth: Dimensions.get('window').height*.00272,
    borderColor: "transparent",
    position: 'absolute',
    alignItems:'center',
    justifyContent:'center',
    fontSize: Dimensions.get('window').width*0.133,
  },
  tutorialPage: {
    height: '90%',
    width: '90%',
    position: 'absolute',
    top: "5%",
    alignSelf:'center',
    borderColor:'black',
    borderWidth: Dimensions.get('window').height*.00272,
    borderRadius: Dimensions.get('window').height*.0204,
    backgroundColor: 'white',
    flex:1,
    flexDirection:'column',
    justifyContent:'flex-start',
    alignItems:'center',
    zIndex:0
  },
  tutorialPageButton: {
    backgroundColor:"white",
    borderColor:'black',
    flex:1,
    right: "-.75%",
  },
  moveToLocationStyle: {
    backgroundColor:"white",
    borderColor:'black',
    borderWidth: Dimensions.get('window').height*.0027,
    borderRadius: Dimensions.get('window').height,
    position: 'absolute',
    flex:1,
    right: "2%",
    top: '85%',
  }
});