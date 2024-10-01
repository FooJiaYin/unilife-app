// import 'react-native-gesture-handler'
import React, { useEffect, useState, useRef } from 'react'
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { firebase } from './src/firebase/config'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as Linking from 'expo-linking'
import { LoginScreen, LineLoginScreen, EmailLoginScreen, ResetPasswordScreen } from './src/screens'
import { RegistrationScreen, FillInfoScreen, TopicSelectScreen, SuccessScreen, VerificationScreen } from './src/screens'
import { HomeScreen, IntroScreen } from './src/screens'
import { ArticleListScreen, CommunityScreen, FilterScreen, ArticleScreen, CommentScreen, NewArticleScreen, ShopScreen } from './src/screens'
import { ChatroomScreen, MessageScreen } from './src/screens'
import { SettingScreen, ProfileScreen } from './src/screens'
import { tabBarObject, tabBarOptions } from './src/components/navigation'
// import {decode, encode} from 'base-64'
// import Test from './src/screens/text'
// if (!global.btoa) {  global.btoa = encode }
// if (!global.atob) { global.atob = decode }

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator();

const prefix = Linking.makeUrl('/');

const linking = {
	prefixes: [prefix],
	config: {
		screens: {
			Login: "login",
			LineLogin: "login/:token",
			Tabs: {
				screens: {
					ArticleStack: {
						initialRouteName: 'Articles',
						screens: {
							Articles: "articles",
							Filter: "articles/filter/:type/:data?",
							Article: {
								path: 'article/:id',
								parse: {
								  	article: (id) => ({id: id}),
								},
							}
						}
					},
					CommunityStack: {
						initialRouteName: 'Community',
						screens: {
							Community: "community",
							Article: {
								path: 'post/:id',
								parse: {
									  article: (id) => ({id: id}),
								},
							}
						}
					},
					ShopStack: {
						initialRouteName: 'Shop',
						screens: {
							Shop: "shop",
						}
					},
					ChatStack: {
						screens: {
							Chatroom: "chatrooms",
						}
					},
					SettingStack: {
						screens: {
							Profile: "profile",
						}
					}
				}
			},
			Intro: "intro"
			// Home: "home",
			// Settings: "settings",
		}
	},
	async getInitialURL() {
		// First, you may want to do the default deep link handling
		// Check if app was opened from a deep link
		const url = await Linking.getInitialURL();

		if (url != null) {
		  return url;
		}

		// Handle URL from expo push notifications
		const response = await Notifications.getLastNotificationResponseAsync();

		return response?.notification.request.content.data.url;
	},
	subscribe(listener) {
		const onReceiveURL = ({ url }) => listener(url);

		// Listen to incoming links from deep linking
		const eventListenerSubscription = Linking.addEventListener('url', onReceiveURL);

		// Listen to expo push notifications
		const subscription = Notifications.addNotificationResponseReceivedListener(response => {
			const url = response.notification.request.content.data.url;

			// Any custom logic to see whether the URL needs to be handled
			//...

			// Let React Navigation handle the URL
			listener(url);
		});

		return () => {
			// Clean up the event listeners
			eventListenerSubscription.remove();
			subscription.remove();
		};
	},
}

// Notification behavior when app is opened
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

async function registerForPushNotificationsAsync() {
	let token;
	if (Constants.isDevice) {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== 'granted') {
			alert('Failed to get push token for push notification!');
			return;
		}

		let experienceId = '@foojiayin/unilife';
		token = (await Notifications.getExpoPushTokenAsync({
			experienceId: '@foojiayin/unilife',
			projectId: '8056de9e-2c29-48ec-afd0-fe9f2e5ff125'
		})).data;
		// console.log(token);
	} else {
		alert('Must use physical device for Push Notifications');
	}

	if (Platform.OS === 'android') {
		Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
		});
	}
	return token;
}

export default function App() {
	
	const notificationListener = useRef();
	const responseListener = useRef();
	const [expoPushToken, setExpoPushToken] = useState('');
	const [notification, setNotification] = useState(false);
	const [loading, setLoading] = useState(true)
	const [user, setUser] = useState(null)
	// console.log(user)

	function setupNotification(uid) {
		// console.log('uid', uid)
		registerForPushNotificationsAsync().then(token => {
			console.log('token', token)
			setExpoPushToken(token)
			console.log('user token', token)
			// alert(token)
			if (uid) {
				// console.log('user token', token)
				firebase.firestore().doc('users/' + uid).update({
					pushToken: token
				})
			}
		}).catch(err => {
			console.log('error', err)
			// alert(err)
		})

		notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
			console.log(notification);
			setNotification(notification);
		});

		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
			// console.log(response);
		});

		return () => {
			Notifications.removeNotificationSubscription(notificationListener.current);
			Notifications.removeNotificationSubscription(responseListener.current);
		};
	}

	async function getInitialUrl() {
		const initialURL = await Linking.getInitialURL()
		if (initialURL) {
			return initialURL
			// setData(Linking.parse(initialURL));
		}
	}
	
	useEffect(() => {
		// Linking.addEventListener("url", (event) => {
		// 	console.log('url', event.url)
		// 	if(!data) {
		// 		const url = getInitialUrl();
		// 	}
		// 	let data = Linking.parse(event.url);
		// })
		const usersRef = firebase.firestore().collection('users')
		usersRef.doc("anonymous")
			.get()
			.then((doc) => {
				setLoading(false)
				setUser(doc)
			})
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				usersRef
					.doc(user.uid)
					.get()
					.then((doc) => {
						setLoading(false)
						setUser(doc)
						// console.log('auth', user.uid)
						setupNotification(user.uid)
					})
					.catch((error) => {
						setLoading(false)
					})
			} else {
				setLoading(false)
				usersRef.doc("anonymous")
				.get()
				.then((doc) => {
					setLoading(false)
					setUser(doc)
				})
			}
			// alert('push token', expoPushToken)
		})
		if (user) setupNotification(user.id)
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
				<Stack.Screen name="Filter">
					{props => <FilterScreen {...props} user={user} />}
				</Stack.Screen>
			</Stack.Navigator>
		)
	}

	function ArticleStackScreen(props) {
		return (
			<Stack.Navigator>		
				<Stack.Screen name="Articles">
					{props => <ArticleListScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="Filter">
					{props => <FilterScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="Article">
					{props => <ArticleScreen {...props} user={user} />}
				</Stack.Screen>
			</Stack.Navigator>
		)
	}

	function CommunityStackScreen(props) {
		return (
			<Stack.Navigator>	
				<Stack.Screen name="Community">
					{props => <CommunityScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="Filter">
					{props => <FilterScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="Article">
					{props => <ArticleScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="NewArticle">
					{props => <NewArticleScreen {...props} user={user} />}
				</Stack.Screen>
			</Stack.Navigator>
		)
	}

	function ShopStackScreen(props) {
		return (
			<Stack.Navigator>	
				<Stack.Screen name="Shop">
					{props => <ShopScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="Filter">
					{props => <FilterScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="Article">
					{props => <ArticleScreen {...props} user={user} />}
				</Stack.Screen>
				<Stack.Screen name="NewArticle">
					{props => <NewArticleScreen {...props} user={user} />}
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
		// console.log(props.user) 
		const insets = useSafeAreaInsets();
		return (
			props.user ? (
			<Tab.Navigator 
				lazy={true} 
				screenOptions={{
					...tabBarOptions, 
					tabBarHideOnKeyboard: Platform.OS === "android",
					tabBarStyle: {
						paddingBottom: insets.bottom,
						paddingTop: 10,
						height: 60 + insets.bottom,
					},
					headerShown: false,
				}} 
				initialRouteName="CommunityStack"
				safeAreaInsets={{bottom: insets.bottom}}
			>
				<Tab.Screen name="HomeStack" options={tabBarObject('主頁', 'home')}>
					{props => <HomeStackScreen {...props} user={user} />}
				</Tab.Screen>
				<Tab.Screen name="ArticleStack" options={tabBarObject('資訊', 'news')}>
					{props => <ArticleStackScreen {...props} user={user} />}
				</Tab.Screen>
				<Tab.Screen name="CommunityStack" options={tabBarObject('社群', 'community')}>
					{props => <CommunityStackScreen {...props} user={user} />}
				</Tab.Screen>
				<Tab.Screen name="ShopStack" options={tabBarObject('店家', 'shop')}>
					{props => <ShopStackScreen {...props} user={user} />}
				</Tab.Screen>
				<Tab.Screen name="SettingStack" options={tabBarObject('帳號', 'profile')}>
					{props => <SettingStackScreen {...props} user={user} />}
				</Tab.Screen>
			</Tab.Navigator>
			) : (
				<></>
			)
		)
	}

	return (
		<SafeAreaProvider>
			<StatusBar style="dark" backgroundColor="transparent" />
			<NavigationContainer linking={linking}>
				{ firebase.auth().currentUser ? (
					<Stack.Navigator>	
						{/* <Stack.Screen name="Chatroom">
							{props => <ChatroomScreen {...props} user={user} />}
						</Stack.Screen> */}
						<Stack.Screen name="Tabs" options={{headerShown: false}}>
							{props => <Tabs {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Intro">
							{props => <IntroScreen {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Message">
							{props => <MessageScreen {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Comment">
							{props => <CommentScreen {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Login" component={LoginScreen}/>
						<Stack.Screen name="EmailLogin" component={EmailLoginScreen}/>
						<Stack.Screen name="LineLogin" component={LineLoginScreen}/>
						<Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
						<Stack.Screen name="Registration" component={RegistrationScreen} />
						<Stack.Screen name="FillInfo" component={FillInfoScreen} user={user}/>
						<Stack.Screen name="Topic" options={{title: "選擇興趣"}}>
							{props => <TopicSelectScreen {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Success" options={{title: ""}}>
							{props => <SuccessScreen {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Verification" options={{title: "驗證方式"}}>
							{props => <VerificationScreen {...props} user={user} />}
						</Stack.Screen>
					</Stack.Navigator>
				) :  
				(
					<Stack.Navigator>
						<Stack.Screen name="Login" component={LoginScreen}/>
						<Stack.Screen name="EmailLogin" component={EmailLoginScreen}/>
						<Stack.Screen name="LineLogin" component={LineLoginScreen}/>
						<Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
						<Stack.Screen name="Registration" component={RegistrationScreen} />
						<Stack.Screen name="FillInfo" component={FillInfoScreen}/>
						<Stack.Screen name="Topic" options={{title: "選擇興趣"}}>
							{props => <TopicSelectScreen {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Success" options={{title: ""}}>
							{props => <SuccessScreen {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Verification" options={{title: "驗證方式"}}>
							{props => <VerificationScreen {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Tabs" options={{headerShown: false}}>
							{props => <Tabs {...props} user={user} />}
						</Stack.Screen>
						<Stack.Screen name="Intro">
							{props => <IntroScreen {...props} user={user} />}
						</Stack.Screen>
					</Stack.Navigator>
				)} 
			</NavigationContainer>
		</SafeAreaProvider>
	)
}
