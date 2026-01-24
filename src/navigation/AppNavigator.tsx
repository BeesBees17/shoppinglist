import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { NewListScreen } from "../screens/NewListScreen";
import { ListDetailScreen } from "../screens/ListDetailScreen";
import { ArchivedListsScreen } from "../screens/ArchivedListsScreen";

export type RootStackParamList = {
  Home: undefined;
  NewList: undefined;
  ListDetail: { listId: string };
  Archived: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Shopping Lists" }} />
      <Stack.Screen name="NewList" component={NewListScreen} options={{ title: "New list" }} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} options={{ title: "List" }} />
      <Stack.Screen name="Archived" component={ArchivedListsScreen} options={{ title: "Archived" }} />
    </Stack.Navigator>
  </NavigationContainer>
);
