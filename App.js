import 'react-native-gesture-handler'
import React, { useEffect, useState } from 'react'
import { firebase } from './src/firebase/config'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs' 
import { LoginScreen, RegistrationScreen, FillInfoScreen } from './src/screens'
import { HomeScreen, SavedScreen, ArticleScreen, CommentScreen } from './src/screens'
import { ChatroomScreen, MessageScreen } from './src/screens'
import { SettingScreen, ProfileScreen } from './src/screens'
import { headerOptions } from './src/components/header'
import {decode, encode} from 'base-64'
import TopicSelectScreen from './src/screens/TopicSelectScreen'
import SuccessScreen from './src/screens/SuccessScreen'
import Test from './src/screens/text'
if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

export default function App() {
	
	const [loading, setLoading] = useState(true)
	const [user, setUser] = useState(null)
	
	useEffect(() => {
		const usersRef = firebase.firestore().collection('users')
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
			usersRef
				.doc(user.uid)
				.get()
				.then((doc) => {
				setLoading(false)
				setUser(doc)
				})
				.catch((error) => {
				setLoading(false)
				})
			} else {
			setLoading(false)
			}
		})
	}, [])

	if (loading) {
		return (
			<></>
		)
	}

	function ChatStackScreen(props) {
		return (
			<Stack.Navigator>
				<Stack.Screen name="Chatroom">
					{props => <ChatroomScreen {...props} user={user} />}
				</Stack.Screen>	
				{/* <Stack.Screen name="Message">
					{props => <MessageScreen {...props} user={user} />}
				</Stack.Screen> */}
			</Stack.Navigator>
		)
	}

	function HomeStackScreen(props) {
		return (
			<Stack.Navigator>		  
				<Stack.Screen name="Home">
					{props => <HomeScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="Saved">
					{props => <SavedScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="Article">
					{props => <ArticleScreen {...props} user={user} />}
				</Stack.Screen>
			</Stack.Navigator>
		)
	}
	
	/* Setting Stack */
	function SettingStackScreen(props) {
		const Stack = createStackNavigator()
		return (
			<Stack.Navigator>
				<Stack.Screen name="Profile">
					{props => <ProfileScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="Settings">
					{props => <SettingScreen {...props} user={user} />}
				</Stack.Screen>
				{/* <Stack.Screen name="Topic" options={{title: "選擇興趣"}}>
					{props => <TopicSelectScreen/>}
				</Stack.Screen> */}
			</Stack.Navigator>
		)
	}

	function Tabs(props) {
		return (
			<Tab.Navigator>
				<Tab.Screen name="HomeStack" options={{tabBarLabel:"主頁"}}>
					{props => <HomeStackScreen {...props} user={user} />}
				</Tab.Screen>
				<Tab.Screen name="ChatStack" options={{tabBarLabel:"聊天室"}}>
					{props => <ChatStackScreen {...props} user={user} />}
				</Tab.Screen>
				<Tab.Screen name="SettingStack" options={{tabBarLabel:"帳戶"}}>
					{props => <SettingStackScreen {...props} user={user} />}
				</Tab.Screen>
			</Tab.Navigator>
		)
	}

	return (
		<NavigationContainer>
			{ user ? (
				<Stack.Navigator>	
					{/* <Stack.Screen name="Chatroom">
						{props => <ChatroomScreen {...props} user={user} />}
					</Stack.Screen> */}
					<Stack.Screen name="Tabs" options={{header: ()=><></>}}>
						{props => <Tabs {...props} user={user} />}
					</Stack.Screen>
					<Stack.Screen name="Message">
						{props => <MessageScreen {...props} user={user} />}
					</Stack.Screen>
					<Stack.Screen name="Comment">
						{props => <CommentScreen {...props} user={user} />}
					</Stack.Screen>
				</Stack.Navigator>
			) :  
			(
				<Stack.Navigator>
					<Stack.Screen name="Login" component={LoginScreen}/>
					<Stack.Screen name="FillInfo" component={FillInfoScreen}/>
					<Stack.Screen name="Registration" component={RegistrationScreen} />
					<Stack.Screen name="Success" options={{title: ""}}>
						{props => <Test {...props} user={user} />}
					</Stack.Screen>
					<Stack.Screen name="Topic" options={{title: "選擇興趣"}}>
						{props => <TopicSelectScreen {...props} user={user} />}
					</Stack.Screen>
				</Stack.Navigator>
			)} 
		</NavigationContainer>
	)
}
