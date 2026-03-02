import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainView from './views/_mainView';
import SignInView from './views/_signinView';
import AdminView from './views/_adminView';
import CountryMasterView from './views/_countryMasterView';
import AbbreviationMasterView from './views/_abbreviationMasterView';
import ExploreView from './views/_exploreView';
import VisaListView from './views/_visaListView';
import CategoryMasterView from './views/_categoryMasterView';
import CountryExplorerView from './views/_countryExplorerView';
import VisaAdvisorView from './views/_visaAdvisoryView';
import VisaMasterView from './views/_visaMasterView';
import VisaListMasterView from './views/_visaListMasterView';
import CommunityView from './views/_communityView';
import LanguageMasterView from './views/_languageMasterView';
import AdminSettingsView from './views/_adminSettingView';
import InterviewLandingView from './views/_interviewLandingPageView';
import InterviewSimulatorView from './views/_interviewSimulatorView';
import AppLayout from './views/_appLayoutView';
import BookmarkView from './views/_bookmarksView';
import ProfileView from './views/_userProfileView';
import LandingView from './views/_landingView';
import AgentControlView from './views/_agentControlView';
import RequestVisaView from './views/_requestVisaView';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing" // 👈 Landing is the first screen
        screenOptions={{ headerShown: false }}
      >
        {/* 🛬 Landing Screen - no AppLayout */}
        <Stack.Screen name="Landing" component={LandingView} />

        {/* 🏠 Main App Screens */}
        <Stack.Screen name="Main">
          {(props) => (
            <AppLayout>
              <MainView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="SignIn" component={SignInView} />

        <Stack.Screen name="AdminView">
          {(props) => (
            <AppLayout>
              <AdminView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="CountryMasterView">
          {(props) => (
            <AppLayout>
              <CountryMasterView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="AbbreviationMasterView">
          {(props) => (
            <AppLayout>
              <AbbreviationMasterView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="ExploreView">
          {(props) => (
            <AppLayout>
              <ExploreView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="RequestVisa">
          {(props) => (
            <AppLayout>
              <RequestVisaView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="VisaListView">
          {(props) => (
            <AppLayout>
              <VisaListView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="CategoryMasterView">
          {(props) => (
            <AppLayout>
              <CategoryMasterView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="VisaMasterView">
          {(props) => (
            <AppLayout>
              <VisaMasterView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>
        <Stack.Screen name="AgentControlView">
          {(props) => (
            <AppLayout>
              <AgentControlView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="VisaListMasterView">
          {(props) => (
            <AppLayout>
              <VisaListMasterView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="CommunityView">
          {(props) => (
            <AppLayout>
              <CommunityView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="CountryExplorerView">
          {(props) => (
            <AppLayout>
              <CountryExplorerView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="LanguageMasterView">
          {(props) => (
            <AppLayout>
              <LanguageMasterView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="Settings">
          {(props) => (
            <AppLayout>
              <AdminSettingsView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="VisaAdvisorView">
          {(props) => (
            <AppLayout>
              <VisaAdvisorView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="Interview Setup">
          {(props) => (
            <AppLayout>
              <InterviewLandingView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="Interview Session">
          {(props) => (
            <AppLayout>
              <InterviewSimulatorView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="Bookmarks">
          {(props) => (
            <AppLayout>
              <BookmarkView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="UserProfile">
          {(props) => (
            <AppLayout>
              <ProfileView {...props} />
            </AppLayout>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
