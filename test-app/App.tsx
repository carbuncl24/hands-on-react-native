import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Alert } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { useEffect } from "react";

export default function App() {
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log("인증 상태:", authStatus);
    }
    return enabled;
  };

  useEffect(() => {
    const setupMessaging = async () => {
      const permissionGranted = await requestUserPermission();
      if (permissionGranted) {
        const token = await messaging().getToken();
        console.log(token);
      } else {
        console.log("권한이 허용되지 않았습니다");
      }

      // 초기 알림이 있는지 확인
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log(
          "종료 상태에서 앱을 열게 한 알림:",
          initialNotification.notification
        );
      }

      // 백그라운드에서 앱이 열릴 때 알림 처리
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log(
          "알림이 백그라운드 상태에서 앱을 실행시켰습니다:",
          remoteMessage.notification
        );
      });

      // 백그라운드 핸들러 등록
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log("메시지가 백그라운드에서 처리되었습니다!", remoteMessage);
      });

      // 포그라운드 메시지 처리
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        const { title, body } = remoteMessage.notification || {};

        Alert.alert(
          title || "새로운 FCM 메시지!",
          body || "메시지의 내용을 확인할 수 없습니다."
        );
      });

      return unsubscribe;
    };

    setupMessaging();
  }, []);

  return (
    <View style={styles.container}>
      <Text>FCM 테스트!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
