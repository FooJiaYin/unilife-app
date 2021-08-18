import 'react-native-gesture-handler'
import React, { useEffect, useState } from 'react'
import { firebase } from './src/firebase/config'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs' 
import { LoginScreen, RegistrationScreen, FillInfoScreen, TopicSelectScreen, SuccessScreen } from './src/screens'
import { HomeScreen, SavedScreen, ArticleScreen, CommentScreen } from './src/screens'
import { ChatroomScreen, MessageScreen } from './src/screens'
import { SettingScreen, ProfileScreen } from './src/screens'
import { tabBarObject, tabBarOptions } from './src/components/navigation'
import {decode, encode} from 'base-64'
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
			<Tab.Navigator tabBarOptions={tabBarOptions}>
				<Tab.Screen name="HomeStack" options={tabBarObject('主頁', 'home')}>
					{props => <HomeStackScreen {...props} user={user} />}
				</Tab.Screen>
				<Tab.Screen name="ChatStack" options={tabBarObject('聊天室', 'chat')}>
					{props => <ChatStackScreen {...props} user={user} />}
				</Tab.Screen>
				<Tab.Screen name="SettingStack" options={tabBarObject('帳戶', 'profile')}>
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
					<Stack.Screen name="Tabs" options={{headerShown: false}}>
						{props => <Tabs {...props} user={user} />}
					</Stack.Screen>
					<Stack.Screen name="Message">
						{props => <MessageScreen {...props} user={user} />}
					</Stack.Screen>
					<Stack.Screen name="Comment">
						{props => <CommentScreen {...props} user={user} />}
					</Stack.Screen>
					<Stack.Screen name="Login" component={LoginScreen}/>
					
					<Stack.Screen name="FillInfo" component={FillInfoScreen} user={user}/>
					<Stack.Screen name="Topic" options={{title: "選擇興趣"}}>
						{props => <TopicSelectScreen {...props} user={user} />}
					</Stack.Screen>
					<Stack.Screen name="Success" options={{title: ""}}>
						{props => <SuccessScreen {...props} user={user} />}
					</Stack.Screen>
				</Stack.Navigator>
			) :  
			(
				<Stack.Navigator>
					<Stack.Screen name="Login" component={LoginScreen}/>
					<Stack.Screen name="Registration" component={RegistrationScreen} />
					<Stack.Screen name="FillInfo" component={FillInfoScreen}/>
					<Stack.Screen name="Topic" options={{title: "選擇興趣"}}>
						{props => <TopicSelectScreen {...props} user={user} />}
					</Stack.Screen>
					<Stack.Screen name="Success" options={{title: ""}}>
						{props => <SuccessScreen {...props} user={user} />}
					</Stack.Screen>
					<Stack.Screen name="Tabs" options={{headerShown: false}}>
						{props => <Tabs {...props} user={user} />}
					</Stack.Screen>
				</Stack.Navigator>
			)} 
		</NavigationContainer>
	)
}
