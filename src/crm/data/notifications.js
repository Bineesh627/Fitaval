/**
 * ==============================================================================
 * Fitaval CRM — Notifications Mock Data
 * ==============================================================================
 */

export const MOCK_NOTIFICATIONS = [
  {
    id: "notif_1",
    title: "Membership Expiring Soon",
    message: "Karan Mehra's Monthly Basic expires in 4 days. Send renewal reminder.",
    time: "10 mins ago",
    type: "member",
    read: false,
    linkTo: "/members",
  },
  {
    id: "notif_2",
    title: "Payment Received",
    message: "₹3,999 received from Ananya Deshmukh for Quarterly Pro plan.",
    time: "2 hours ago",
    type: "billing",
    read: false,
    linkTo: "/finance",
  },
  {
    id: "notif_3",
    title: "Trainer Assigned",
    message: "Alex Carter assigned to 2 new members for Personal Training shift.",
    time: "Yesterday",
    type: "trainer",
    read: false,
    linkTo: "/staff",
  },
  {
    id: "notif_4",
    title: "Unpaid Invoice Alert",
    message: "Vikram Singhania has an outstanding payment of ₹1,499.",
    time: "2 days ago",
    type: "billing",
    read: true,
    linkTo: "/members",
  },
  {
    id: "notif_5",
    title: "System Update",
    message: "Fitaval CRM v1.2 updated with OpenStreetMap & Dark Mode theme.",
    time: "3 days ago",
    type: "system",
    read: true,
    linkTo: "/settings",
  },
];

// For backward compatibility
export const INITIAL_NOTIFICATIONS = MOCK_NOTIFICATIONS;

