import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    } as Notifications.NotificationBehavior),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isWeb) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDueDateReminder(
  transactionId: string,
  customerName: string,
  amount: number,
  dueDate: Date,
): Promise<string | null> {
  if (isWeb) return null;
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const now = new Date();
  const threeDaysBefore = new Date(dueDate);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

  const onDueDate = new Date(dueDate);
  onDueDate.setHours(9, 0, 0, 0);

  const amountFormatted = amount.toLocaleString('id-ID');

  if (threeDaysBefore > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pengingat Jatuh Tempo',
        body: `Utang ${customerName} sebesar Rp ${amountFormatted} jatuh tempo dalam 3 hari lagi.`,
        data: { transactionId, type: 'due_date_reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: threeDaysBefore,
      },
    });
  }

  const reminderId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Jatuh Tempo Hari Ini!',
      body: `Utang ${customerName} sebesar Rp ${amountFormatted} jatuh tempo hari ini. Segera tagih.`,
      data: { transactionId, type: 'due_date_today' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: onDueDate,
    },
  });

  return reminderId;
}

export async function cancelNotificationByTransactionId(transactionId: string): Promise<void> {
  if (isWeb) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.transactionId === transactionId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (isWeb) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  if (isWeb) return [];
  return await Notifications.getAllScheduledNotificationsAsync();
}

export async function rescheduleAllReminders(
  transactions: { id: string; customerName: string; amount: number; dueDate: string }[],
): Promise<void> {
  if (isWeb) return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  for (const tx of transactions) {
    const dueDate = new Date(tx.dueDate);
    if (dueDate <= now) continue;

    const threeDaysBefore = new Date(dueDate);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

    const onDueDate = new Date(dueDate);
    onDueDate.setHours(9, 0, 0, 0);

    const amountFormatted = tx.amount.toLocaleString('id-ID');

    if (threeDaysBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pengingat Jatuh Tempo',
          body: `Utang ${tx.customerName} sebesar Rp ${amountFormatted} jatuh tempo dalam 3 hari lagi.`,
          data: { transactionId: tx.id, type: 'due_date_reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: threeDaysBefore,
        },
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Jatuh Tempo Hari Ini!',
        body: `Utang ${tx.customerName} sebesar Rp ${amountFormatted} jatuh tempo hari ini. Segera tagih.`,
        data: { transactionId: tx.id, type: 'due_date_today' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: onDueDate,
      },
    });
  }
}
