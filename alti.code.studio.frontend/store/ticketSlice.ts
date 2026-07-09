import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MessageType = "customer" | "support";

export type TicketMessage = {
  id: string;
  senderType: MessageType;
  senderName: string;
  text: string;
  date: string;
};

export type Ticket = {
  id: string;
  customerName: string;
  subject: string;
  messages: TicketMessage[];
  status: "Open" | "Resolved";
  date: string;
};

const initialState: { tickets: Ticket[] } = {
  tickets: [
    {
      id: "tkt-1",
      customerName: "Ada Lovelace",
      subject: "Help with billing details",
      messages: [
        {
          id: "m1",
          senderType: "customer",
          senderName: "Ada Lovelace",
          text: "I need to update my credit card on file but I can't find where to do it. Can you help me navigate to the right section? I looked under settings but didn't see an option for payment methods.",
          date: "2 hours ago",
        },
        {
          id: "m2",
          senderType: "support",
          senderName: "Support Team",
          text: "Hi Ada,\n\nThanks for reaching out! You can update your payment method by going to the Billing tab on the sidebar and clicking on 'Update Payment Method'. Let me know if you still have trouble finding it.\n\nBest,\nSupport Team",
          date: "1 hour ago",
        },
      ],
      status: "Open",
      date: "Just now",
    },
    {
      id: "tkt-2",
      customerName: "Grace Hopper",
      subject: "Error when inviting team member",
      messages: [
        {
          id: "m3",
          senderType: "customer",
          senderName: "Grace Hopper",
          text: "I tried to invite a new team member but I got an error saying 'Domain mismatch'. What does this mean? Do they need to have the same email domain as me?",
          date: "2 hours ago",
        },
      ],
      status: "Open",
      date: "2 hours ago",
    },
    {
      id: "tkt-3",
      customerName: "Alan Turing",
      subject: "Cloud Environment Setup",
      messages: [
        {
          id: "m4",
          senderType: "customer",
          senderName: "Alan Turing",
          text: "Everything worked perfectly. Just wanted to say thanks for the quick turnaround on my environment setup yesterday. The platform is running very smoothly.",
          date: "2 days ago",
        },
      ],
      status: "Resolved",
      date: "2 days ago",
    },
  ],
};

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    addReply: (
      state,
      action: PayloadAction<{ ticketId: string; message: TicketMessage }>,
    ) => {
      const ticket = state.tickets.find(
        (t) => t.id === action.payload.ticketId,
      );

      if (ticket) {
        ticket.messages.push(action.payload.message);
        ticket.date = "Just now"; // update the ticket date to reflect recent activity
      }
    },
  },
});

export const { addReply } = ticketSlice.actions;
export default ticketSlice.reducer;
